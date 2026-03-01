const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const payOrder = async (orderId, clientId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError(404, "Order not found.");
  }

  if (order.clientId.toString() !== clientId) {
    throw createError(403, "Not allowed.");
  }

  if (order.status !== "pending") {
    throw createError(400, "Order already paid or invalid.");
  }

  const orderItems = await OrderItem.find({ orderId });

  // 🔥 Vérifier stock AVANT paiement
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw createError(404, "Product not found.");
    }

    if (product.stock < item.quantity) {
      throw createError(
        400,
        `Not enough stock for product ${product.name}`
      );
    }
  }

  // 🔥 Déduire stock
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);

    product.stock -= item.quantity;
    await product.save();
  }

  // ✅ Changer statut
  order.status = "paid";
  order.paidAt = new Date();
  await order.save();

  return order;
};

module.exports = {
  payOrder,
};