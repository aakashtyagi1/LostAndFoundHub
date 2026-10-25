import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Accessories",
        "Documents",
        "Books",
        "Clothing",
        "Keys",
        "Others",
      ],
      default: "Others",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Lost", "Found"],
      default: "Lost",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reportedBy: {
      type: String,
      default: "Anonymous",
    },
    ownerEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Claimed", "Returned", "Resolved"],
      default: "Active",
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        // Also provide image alias for backwards-compatibility with frontend
        ret.image = ret.imageUrl || "";
        return ret;
      },
    },
  }
);

itemSchema.index({ name: "text", description: "text", location: "text" });

export const Item = mongoose.model("Item", itemSchema);
