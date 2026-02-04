const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    method: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    transactionRef: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
