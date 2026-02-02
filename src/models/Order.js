const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, default: "pending", trim: true },
    totalAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

orderSchema.index({ clientId: 1 });

module.exports = mongoose.model("Order", orderSchema);
