import express from "express";
import { Item } from "../models/Item.js";
import { Claim } from "../models/Claim.js";
import { User } from "../models/User.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
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
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: users.length,
      data: users.map((u) => u.toJSON()),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
