import express from "express";
import { Claim } from "../models/Claim.js";
import { Item } from "../models/Item.js";
import { Notification } from "../models/Notification.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/claims - get claims (supports filter by email or all for admin)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { email, role } = req.query;

    let query = {};
    if (role !== "admin" && email) {
      const normalizedEmail = email.trim().toLowerCase();
      query = {
        $or: [
          { claimantEmail: normalizedEmail },
          { ownerEmail: normalizedEmail },
        ],
      };
    }

    const claims = await Claim.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: claims.length,
      data: claims.map((c) => c.toJSON()),
    });
  } catch (error) {
    console.error("Fetch Claims Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch claims.",
    });
  }
});

// POST /api/claims - submit new claim
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      itemId,
      itemName,
      claimantName,
      claimantEmail,
      claimantPhone,
      reason,
      proofImageUrl,
    } = req.body;

    if (!itemId || !claimantName || !claimantEmail || !reason) {
      return res.status(400).json({
        success: false,
        message: "Item ID, claimant name, email, and proof details are required.",
      });
    }

    // Lookup original item if possible to get owner email
    let ownerEmail = "";
    let effectiveItemName = itemName;
    const item = await Item.findById(itemId).catch(() => null);
    if (item) {
      ownerEmail = item.ownerEmail || "";
      effectiveItemName = item.name;
    }

    const newClaim = new Claim({
      itemId,
      itemName: effectiveItemName,
      claimantName: claimantName.trim(),
      claimantEmail: claimantEmail.trim().toLowerCase(),
      claimantPhone: claimantPhone || "",
      ownerEmail: ownerEmail.trim().toLowerCase(),
      reason: reason.trim(),
      proofImageUrl: proofImageUrl || "",
      status: "Pending",
    });

    await newClaim.save();

    // Notify item reporter / owner
    if (ownerEmail && ownerEmail !== claimantEmail.trim().toLowerCase()) {
      await Notification.create({
        recipientEmail: ownerEmail,
        title: `New Claim for "${effectiveItemName}"`,
        message: `${claimantName} submitted a recovery claim for "${effectiveItemName}". Please review the proof.`,
        type: "info",
      });
    }

    // Notify claimant
    await Notification.create({
      recipientEmail: claimantEmail.trim().toLowerCase(),
      title: `Claim Submitted: "${effectiveItemName}"`,
      message: `Your claim request for "${effectiveItemName}" has been received and is pending verification.`,
      type: "success",
    });

    return res.status(201).json({
      success: true,
      message: "Claim submitted successfully! The owner/admin has been notified.",
      data: newClaim.toJSON(),
    });
  } catch (error) {
    console.error("Submit Claim Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit claim.",
    });
  }
});

import mongoose from "mongoose";

// PUT /api/claims/:id/status - approve or reject claim
router.put("/:id/status", optionalAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Pending, Approved, or Rejected.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }

    claim.status = status;
    if (adminNotes !== undefined) claim.adminNotes = adminNotes;
    await claim.save();

    // If approved, update associated item status to "Claimed" or "Returned"
    if (status === "Approved" && claim.itemId) {
      const item = await Item.findById(claim.itemId).catch(() => null);
      if (item) {
        item.status = item.type === "Lost" ? "Returned" : "Claimed";
        await item.save();
      }
    }

    // Send notification to claimant
    const notifTitle =
      status === "Approved"
        ? `Claim Approved for "${claim.itemName}"! 🎉`
        : `Update on Claim for "${claim.itemName}"`;

    const notifMsg =
      status === "Approved"
        ? `Congratulations! Your claim for "${claim.itemName}" has been verified and approved.`
        : `Your claim for "${claim.itemName}" was marked as ${status.toLowerCase()}. Contact administration for details.`;

    await Notification.create({
      recipientEmail: claim.claimantEmail,
      title: notifTitle,
      message: notifMsg,
      type: status === "Approved" ? "success" : "warning",
    });

    return res.json({
      success: true,
      message: `Claim status updated to ${status}.`,
      data: claim.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/claims/:id
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }
    const claim = await Claim.findByIdAndDelete(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }
    return res.json({ success: true, message: "Claim deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
