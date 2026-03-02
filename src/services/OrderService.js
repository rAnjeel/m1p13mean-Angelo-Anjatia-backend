const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const payOrder = async (orderId, clientId, payload = {}) => {
  const paymentMethodRaw = String(payload?.paymentMethod || "").trim().toLowerCase();
  const cardNumberRaw = String(payload?.cardNumber || "").replace(/\s+/g, "");
  const cardHolderName = String(payload?.cardHolderName || "").trim();
  const pickupDateRaw = payload?.pickupDate;

  if (!["bank_card", "visa"].includes(paymentMethodRaw)) {
    throw createError(400, "Payment method must be 'bank_card' or 'visa'.");
  }

  if (!/^\d{12,19}$/.test(cardNumberRaw)) {
    throw createError(400, "Card number must contain 12 to 19 digits.");
  }

  if (!cardHolderName) {
    throw createError(400, "Card holder name is required.");
  }

  if (!pickupDateRaw) {
    throw createError(400, "Pickup date is required.");
  }

  const pickupDate = new Date(pickupDateRaw);
  if (Number.isNaN(pickupDate.getTime())) {
    throw createError(400, "Pickup date is invalid.");
  }

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

  // Verify stock before payment.
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

  // Deduct stock.
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    const stockBefore = Number(product.stock || 0);

    product.stock -= item.quantity;
    await product.save();

    await StockMovement.create({
      productId: item.productId,
      shopId: item.shopId,
      type: "OUT",
      quantity: Number(item.quantity || 0),
      stockBefore,
      stockAfter: Number(product.stock || 0),
      reason: "Order paid",
      reference: `ORDER_PAY:${order._id}`,
    });
  }

  // Mark order as paid and persist payment metadata.
  order.status = "paid";
  order.paymentMethod = paymentMethodRaw;
  order.cardLast4 = cardNumberRaw.slice(-4);
  order.cardHolderName = cardHolderName;
  order.pickupDate = pickupDate;
  order.paidAt = new Date();
  await order.save();

  // Remove paid products from the client's cart after successful payment.
  for (const item of orderItems) {
    const cart = await Cart.findOne({
      clientId,
      shopId: item.shopId,
    });

    if (!cart) {
      continue;
    }

    await CartItem.deleteOne({
      cartId: cart._id,
      productId: item.productId,
    });

    const remaining = await CartItem.countDocuments({ cartId: cart._id });
    if (remaining === 0) {
      await Cart.findByIdAndDelete(cart._id);
    }
  }

  return { order, items: orderItems };
};

module.exports = {
  payOrder,
};
