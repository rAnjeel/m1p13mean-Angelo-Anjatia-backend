const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ["IN", "OUT", "RESERVE", "RELEASE", "ADJUST"]
    },
    quantity: {
      type: Number,
      required: true
    },
    stockBefore: {
      type: Number,
      required: true,
      min: 0
    },
    stockAfter: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      trim: true
    },
    reference: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ shopId: 1, createdAt: -1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema);
