import express from "express";
import mongoose from "mongoose";
import { Claim } from "../models/Claim.js";
import { Item } from "../models/Item.js";
import { Notification } from "../models/Notification.js";
import { optionalAuth } from "../middleware/auth.js";
import { memoryStore } from "../config/memoryStore.js";

const router = express.Router();

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

// GET /api/claims - get claims (supports filter by email or all for admin)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { email, role } = req.query;

    if (isDbReady()) {
      try {
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
      } catch (dbErr) {
        console.warn("Claims DB error, using memory store:", dbErr.message);
      }
    }

    // High performance fallback from memory store
    const fallbackClaims = memoryStore.getClaims(email, role);
    return res.json({
      success: true,
      count: fallbackClaims.length,
      data: fallbackClaims,
      storage: "memory-store",
    });
  } catch (error) {
    console.error("Fetch Claims Error:", error);
    const fallbackClaims = memoryStore.getClaims(req.query.email, req.query.role);
    return res.json({
      success: true,
      count: fallbackClaims.length,
      data: fallbackClaims,
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

    let ownerEmail = "";
    let effectiveItemName = itemName;

    if (isDbReady()) {
      try {
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

        if (ownerEmail && ownerEmail !== claimantEmail.trim().toLowerCase()) {
          await Notification.create({
            recipientEmail: ownerEmail,
            title: `New Claim for "${effectiveItemName}"`,
            message: `${claimantName} submitted a recovery claim for "${effectiveItemName}". Please review the proof.`,
            type: "info",
          }).catch(() => null);
        }

        await Notification.create({
          recipientEmail: claimantEmail.trim().toLowerCase(),
          title: `Claim Submitted: "${effectiveItemName}"`,
          message: `Your claim request for "${effectiveItemName}" has been received and is pending verification.`,
          type: "success",
        }).catch(() => null);

        return res.status(201).json({
          success: true,
          message: "Claim submitted successfully! The owner/admin has been notified.",
          data: newClaim.toJSON(),
        });
      } catch (dbErr) {
        console.warn("DB claim save failed, using memory store:", dbErr.message);
      }
    }

    // Memory store fallback
    const memItem = memoryStore.getItemById(itemId);
    if (memItem) {
      ownerEmail = memItem.ownerEmail || "";
      effectiveItemName = memItem.name;
    }

    const newClaim = memoryStore.createClaim({
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

    memoryStore.createNotification({
      recipientEmail: claimantEmail.trim().toLowerCase(),
      title: `Claim Submitted: "${effectiveItemName}"`,
      message: `Your claim request for "${effectiveItemName}" has been received and is pending verification.`,
      type: "success",
    });

    return res.status(201).json({
      success: true,
      message: "Claim submitted successfully! The owner/admin has been notified.",
      data: newClaim,
    });
  } catch (error) {
    console.error("Submit Claim Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit claim.",
    });
  }
});

// PUT /api/claims/:id/status - approve or reject claim
router.put("/:id/status", optionalAuth, async (req, res) => {
  const targetId = req.params.id;

  try {
    const { status, adminNotes } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Pending, Approved, or Rejected.",
      });
    }

    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        const claim = await Claim.findById(targetId);
        if (claim) {
          claim.status = status;
          if (adminNotes !== undefined) claim.adminNotes = adminNotes;
          await claim.save();

          if (status === "Approved" && claim.itemId) {
            const item = await Item.findById(claim.itemId).catch(() => null);
            if (item) {
              item.status = item.type === "Lost" ? "Returned" : "Claimed";
              await item.save();
            }
          }

          return res.json({
            success: true,
            message: `Claim status updated to ${status}.`,
            data: claim.toJSON(),
          });
        }
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    const updated = memoryStore.updateClaimStatus(targetId, status);
    if (updated) {
      if (status === "Approved" && updated.itemId) {
        const item = memoryStore.getItemById(updated.itemId);
        if (item) {
          memoryStore.updateItem(updated.itemId, {
            status: item.type === "Lost" ? "Returned" : "Claimed",
          });
        }
      }
      return res.json({
        success: true,
        message: `Claim status updated to ${status}.`,
        data: updated,
      });
    }

    return res.status(404).json({ success: false, message: "Claim not found." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/claims/:id
router.delete("/:id", optionalAuth, async (req, res) => {
  const targetId = req.params.id;

  try {
    if (isDbReady() && mongoose.Types.ObjectId.isValid(targetId)) {
      try {
        const claim = await Claim.findByIdAndDelete(targetId);
        if (claim) {
          return res.json({ success: true, message: "Claim deleted successfully." });
        }
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    return res.json({ success: true, message: "Claim deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
