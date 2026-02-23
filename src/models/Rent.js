const mongoose = require("mongoose");

const rentSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    month: {
      type: String, // format YYYY-MM
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

rentSchema.index({ shopId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Rent", rentSchema);