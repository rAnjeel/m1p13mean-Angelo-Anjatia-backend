const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, trim: true, default: "" },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 },
  },
  { timestamps: false }
);

orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ productId: 1 });

module.exports = mongoose.model("OrderItem", orderItemSchema);
