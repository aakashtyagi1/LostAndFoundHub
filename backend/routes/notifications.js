import express from "express";
import { Notification } from "../models/Notification.js";

const router = express.Router();

// GET /api/notifications?email=...
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.json({ success: true, count: 0, data: [] });
    }

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
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    return res.json({ success: true, data: notification.toJSON() });
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
    await Notification.updateMany(
      { recipientEmail: email.trim().toLowerCase() },
      { read: true }
    );
    return res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Notification deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
