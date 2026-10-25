import express from "express";
import { Item } from "../models/Item.js";
import { Notification } from "../models/Notification.js";
import { optionalAuth, authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/items - list items with filters
router.get("/", async (req, res) => {
  try {
    const { search, category, location, type, status, limit = 100 } = req.query;

    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: regex },
        { description: regex },
        { location: regex },
        { category: regex },
      ];
    }

    if (category && category !== "All Categories") {
      query.category = category;
    }

    if (location && location !== "Any Location") {
      query.location = location;
    }

    if (type && type !== "All") {
      query.type = type;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({
      success: true,
      count: items.length,
      data: items.map((i) => i.toJSON()),
    });
  } catch (error) {
    console.error("Fetch Items Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch items.",
    });
  }
});

// GET /api/items/matches/:id - smart match suggestions
router.get("/matches/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const oppositeType = item.type === "Lost" ? "Found" : "Lost";

    // Split words from the item name for keyword matching
    const keywords = item.name
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const regexPattern = keywords.length > 0 ? keywords.join("|") : item.name;

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
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/items/:id - single item
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    return res.json({ success: true, data: item.toJSON() });
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

    // Smart Match Check: Find opposite type with same category to notify user
    const oppositeType = type === "Lost" ? "Found" : "Lost";
    const matchingItems = await Item.find({
      _id: { $ne: newItem._id },
      type: oppositeType,
      category: newItem.category,
      status: "Active",
    }).limit(3);

    // If matches found and user has email, create in-app notification
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
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

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
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/items/:id - delete item
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    return res.json({
      success: true,
      message: "Item deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
