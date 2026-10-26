import express from "express";
import mongoose from "mongoose";
import { Notification } from "../models/Notification.js";
import { memoryStore } from "../config/memoryStore.js";

const router = express.Router();

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

// GET /api/notifications?email=...
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.json({ success: true, count: 0, data: [] });
    }

    if (isDbReady()) {
      try {
        const notifications = await Notification.find({
          recipientEmail: email.trim().toLowerCase(),
        })
          .sort({ createdAt: -1 })
          .limit(50);

        return res.json({
          success: true,
          count: notifications.length,
          data: notifications.map((n) => n.toJSON()),
        });
      } catch (dbErr) {
        console.warn("Notifications DB error, using memory store:", dbErr.message);
      }
    }

    // High performance fallback from memory store
    const fallbackNotifs = memoryStore.getNotifications(email);
    return res.json({
      success: true,
      count: fallbackNotifs.length,
      data: fallbackNotifs,
      storage: "memory-store",
    });
  } catch (error) {
    console.error("Notifications Error:", error);
    const fallbackNotifs = memoryStore.getNotifications(req.query.email);
    return res.json({
      success: true,
      count: fallbackNotifs.length,
      data: fallbackNotifs,
    });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res) => {
  const targetId = req.params.id;

  try {
    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        const notification = await Notification.findByIdAndUpdate(
          targetId,
          { read: true },
          { new: true }
        );
        if (notification) {
          return res.json({ success: true, data: notification.toJSON() });
        }
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    const updated = memoryStore.markNotificationRead(targetId);
    if (updated) {
      return res.json({ success: true, data: updated });
    }

    return res.json({ success: true, message: "Marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    if (isDbReady()) {
      try {
        await Notification.updateMany(
          { recipientEmail: email.trim().toLowerCase() },
          { read: true }
        );
        return res.json({ success: true, message: "All notifications marked as read." });
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    memoryStore.markAllNotificationsRead(email);
    return res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", async (req, res) => {
  const targetId = req.params.id;

  try {
    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        await Notification.findByIdAndDelete(targetId);
        return res.json({ success: true, message: "Notification deleted." });
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    memoryStore.deleteNotification(targetId);
    return res.json({ success: true, message: "Notification deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
