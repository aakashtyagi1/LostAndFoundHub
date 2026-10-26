import express from "express";
import mongoose from "mongoose";
import { Item } from "../models/Item.js";
import { Claim } from "../models/Claim.js";
import { User } from "../models/User.js";
import { memoryStore } from "../config/memoryStore.js";

const router = express.Router();

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    if (isDbReady()) {
      try {
        const [
          totalItems,
          lostCount,
          foundCount,
          activeCount,
          claimedCount,
          totalClaims,
          pendingClaims,
          approvedClaims,
          totalUsers,
        ] = await Promise.all([
          Item.countDocuments(),
          Item.countDocuments({ type: "Lost" }),
          Item.countDocuments({ type: "Found" }),
          Item.countDocuments({ status: "Active" }),
          Item.countDocuments({ status: { $in: ["Claimed", "Returned", "Resolved"] } }),
          Claim.countDocuments(),
          Claim.countDocuments({ status: "Pending" }),
          Claim.countDocuments({ status: "Approved" }),
          User.countDocuments(),
        ]);

        return res.json({
          success: true,
          stats: {
            totalItems,
            lostCount,
            foundCount,
            activeCount,
            claimedCount,
            totalClaims,
            pendingClaims,
            approvedClaims,
            totalUsers,
          },
        });
      } catch (dbErr) {
        console.warn("Admin stats DB error, using memory store:", dbErr.message);
      }
    }

    // High performance fallback from memory store
    const stats = memoryStore.getAdminStats();
    return res.json({
      success: true,
      stats,
      storage: "memory-store",
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    const stats = memoryStore.getAdminStats();
    return res.json({
      success: true,
      stats,
    });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    if (isDbReady()) {
      try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return res.json({
          success: true,
          count: users.length,
          data: users.map((u) => u.toJSON()),
        });
      } catch (dbErr) {
        console.warn("Admin users DB error, using memory store:", dbErr.message);
      }
    }

    const fallbackUsers = memoryStore.getUsers();
    return res.json({
      success: true,
      count: fallbackUsers.length,
      data: fallbackUsers,
      storage: "memory-store",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  const targetId = req.params.id;

  try {
    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        const user = await User.findByIdAndDelete(targetId);
        if (user) {
          return res.json({ success: true, message: "User deleted successfully." });
        }
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    memoryStore.deleteUser(targetId);
    return res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
