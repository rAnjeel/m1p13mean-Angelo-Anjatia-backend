const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  { timestamps: true }
);

cartSchema.index({ clientId: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);