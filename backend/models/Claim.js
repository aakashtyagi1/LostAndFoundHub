import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    claimantName: {
      type: String,
      required: true,
      trim: true,
    },
    claimantEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    claimantPhone: {
      type: String,
      default: "",
    },
    ownerEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    proofImageUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

export const Claim = mongoose.model("Claim", claimSchema);
