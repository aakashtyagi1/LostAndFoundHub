import express from "express";
import mongoose from "mongoose";
import { Item } from "../models/Item.js";
import { Notification } from "../models/Notification.js";
import { optionalAuth } from "../middleware/auth.js";
import { memoryStore } from "../config/memoryStore.js";

const router = express.Router();

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function escapeRegex(str = "") {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// GET /api/items - list items with filters
router.get("/", async (req, res) => {
  try {
    const { search, category, location, type, status, limit = 100 } = req.query;

    if (isDbReady()) {
      try {
        const query = {};

        if (search && search.trim()) {
          const safeSearch = escapeRegex(search.trim());
          const regex = new RegExp(safeSearch, "i");
          query.$or = [
            { name: regex },
            { description: regex },
            { location: regex },
            { category: regex },
          ];
        }

        if (category && category !== "All Categories") query.category = category;
        if (location && location !== "Any Location") query.location = location;
        if (type && type !== "All") query.type = type;
        if (status && status !== "All") query.status = status;

        const items = await Item.find(query)
          .sort({ createdAt: -1 })
          .limit(Number(limit));

        return res.json({
          success: true,
          count: items.length,
          data: items.map((i) => i.toJSON()),
        });
      } catch (dbErr) {
        console.warn("DB query failed, serving from memory store:", dbErr.message);
      }
    }

    // High performance fallback from memory store
    const fallbackItems = memoryStore.getItems({ search, category, location, type, status });
    return res.json({
      success: true,
      count: fallbackItems.length,
      data: fallbackItems,
      storage: "memory-store",
    });
  } catch (error) {
    console.error("Fetch Items Error:", error);
    const fallbackItems = memoryStore.getItems();
    return res.json({
      success: true,
      count: fallbackItems.length,
      data: fallbackItems,
    });
  }
});

// GET /api/items/matches/:id - smart match suggestions (resilient to any ID type)
router.get("/matches/:id", async (req, res) => {
  const targetId = req.params.id;

  try {
    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        const item = await Item.findById(targetId);
        if (item) {
          const oppositeType = item.type === "Lost" ? "Found" : "Lost";
          const keywords = (item.name || "")
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 2)
            .map(escapeRegex);

          const regexPattern = keywords.length > 0 ? keywords.join("|") : escapeRegex(item.name || "");

          const matches = await Item.find({
            _id: { $ne: item._id },
            type: oppositeType,
            status: "Active",
            $or: [
              { category: item.category },
              { name: { $regex: regexPattern, $options: "i" } },
            ],
          }).limit(6);

          return res.json({
            success: true,
            item: item.toJSON(),
            matches: matches.map((m) => m.toJSON()),
          });
        }
      } catch (dbErr) {
        console.warn("Matches DB search error:", dbErr.message);
      }
    }

    // Memory store fallback matching
    const matchResult = memoryStore.getMatches(targetId);
    return res.json({
      success: true,
      item: matchResult.item,
      matches: matchResult.matches,
      storage: "memory-store",
    });
  } catch (error) {
    console.error("Smart match error:", error);
    const matchResult = memoryStore.getMatches(targetId);
    return res.json({
      success: true,
      item: matchResult.item,
      matches: matchResult.matches,
    });
  }
});

// GET /api/items/:id - single item
router.get("/:id", async (req, res) => {
  const targetId = req.params.id;

  try {
    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        const item = await Item.findById(targetId);
        if (item) {
          return res.json({ success: true, data: item.toJSON() });
        }
      } catch (err) {
        // Fallback to memory
      }
    }

    const item = memoryStore.getItemById(targetId);
    if (item) {
      return res.json({ success: true, data: item });
    }

    return res.status(404).json({ success: false, message: "Item not found" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/items - report lost or found item
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      name,
      category,
      location,
      type,
      description,
      reportedBy,
      ownerEmail,
      contactPhone,
      image,
      imageUrl,
      date,
    } = req.body;

    if (!name || !category || !location || !type || !description) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, category, location, type, description).",
      });
    }

    const effectiveOwnerEmail =
      ownerEmail || (req.user ? req.user.email : "");
    const effectiveReportedBy =
      reportedBy || (req.user ? req.user.name : "Anonymous");

    if (isDbReady()) {
      try {
        const newItem = new Item({
          name: name.trim(),
          category,
          location: location.trim(),
          type,
          description: description.trim(),
          reportedBy: effectiveReportedBy,
          ownerEmail: effectiveOwnerEmail,
          contactPhone: contactPhone || "",
          imageUrl: imageUrl || image || "",
          status: "Active",
          date: date || new Date().toISOString().split("T")[0],
        });

        await newItem.save();

        const oppositeType = type === "Lost" ? "Found" : "Lost";
        const matchingItems = await Item.find({
          _id: { $ne: newItem._id },
          type: oppositeType,
          category: newItem.category,
          status: "Active",
        }).limit(3);

        if (matchingItems.length > 0 && effectiveOwnerEmail) {
          await Notification.create({
            recipientEmail: effectiveOwnerEmail,
            title: `Possible Match Found for "${newItem.name}"!`,
            message: `We found ${matchingItems.length} existing ${oppositeType.toLowerCase()} item(s) in category "${newItem.category}" that might match your report.`,
            type: "info",
          });
        }

        return res.status(201).json({
          success: true,
          message: `${type} item reported successfully!`,
          data: newItem.toJSON(),
          matchesFound: matchingItems.length,
        });
      } catch (dbErr) {
        console.warn("DB item save failed, using memory store:", dbErr.message);
      }
    }

    // Save in memory store
    const newItem = memoryStore.createItem({
      name: name.trim(),
      category,
      location: location.trim(),
      type,
      description: description.trim(),
      reportedBy: effectiveReportedBy,
      ownerEmail: effectiveOwnerEmail,
      contactPhone: contactPhone || "",
      imageUrl: imageUrl || image || "",
      status: "Active",
      date: date || new Date().toISOString().split("T")[0],
    });

    const matchInfo = memoryStore.getMatches(newItem.id);

    if (effectiveOwnerEmail && matchInfo.matches.length > 0) {
      memoryStore.createNotification({
        recipientEmail: effectiveOwnerEmail,
        title: `Possible Match Found for "${newItem.name}"!`,
        message: `We found ${matchInfo.matches.length} matching item(s) that might match your report.`,
        type: "info",
      });
    }

    return res.status(201).json({
      success: true,
      message: `${type} item reported successfully!`,
      data: newItem,
      matchesFound: matchInfo.matches.length,
    });
  } catch (error) {
    console.error("Create Item Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save item.",
    });
  }
});

// PUT /api/items/:id - update item
router.put("/:id", optionalAuth, async (req, res) => {
  const targetId = req.params.id;

  try {
    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        const item = await Item.findById(targetId);
        if (item) {
          const {
            name,
            category,
            location,
            type,
            description,
            status,
            imageUrl,
            image,
            contactPhone,
          } = req.body;

          if (name) item.name = name.trim();
          if (category) item.category = category;
          if (location) item.location = location.trim();
          if (type) item.type = type;
          if (description) item.description = description.trim();
          if (status) item.status = status;
          if (imageUrl !== undefined) item.imageUrl = imageUrl;
          if (image !== undefined) item.imageUrl = image;
          if (contactPhone !== undefined) item.contactPhone = contactPhone;

          await item.save();

          return res.json({
            success: true,
            message: "Item updated successfully!",
            data: item.toJSON(),
          });
        }
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    const updated = memoryStore.updateItem(targetId, req.body);
    if (updated) {
      return res.json({
        success: true,
        message: "Item updated successfully!",
        data: updated,
      });
    }

    return res.status(404).json({ success: false, message: "Item not found" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/items/:id - delete item
router.delete("/:id", optionalAuth, async (req, res) => {
  const targetId = req.params.id;

  try {
    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        const item = await Item.findByIdAndDelete(targetId);
        if (item) {
          return res.json({
            success: true,
            message: "Item deleted successfully!",
          });
        }
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    const deleted = memoryStore.deleteItem(targetId);
    return res.json({
      success: true,
      message: deleted ? "Item deleted successfully!" : "Item removed.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
