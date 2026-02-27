const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// 🔥 Add to cart
const addToCart = async (clientId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product) throw createError(404, "Product not found.");

  if (product.stock < quantity)
    throw createError(400, "Not enough stock.");

  let cart = await Cart.findOne({ clientId });

  if (!cart) {
    cart = await Cart.create({ clientId, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      shopId: product.shopId,
      quantity,
    });
  }

  await cart.save();
  return cart;
};

// 🔥 Get cart grouped by shop
const getCart = async (clientId) => {
  return await Cart.findOne({ clientId })
    .populate("items.productId")
    .populate("items.shopId");
};

// 🔥 Checkout selected products
const checkout = async (clientId, productIds = []) => {
  const cart = await Cart.findOne({ clientId });
  if (!cart || cart.items.length === 0)
    throw createError(400, "Cart is empty.");

  const selectedItems =
    productIds.length === 0
      ? cart.items
      : cart.items.filter((item) =>
          productIds.includes(item.productId.toString())
        );

  if (selectedItems.length === 0)
    throw createError(400, "No products selected.");

  const order = await Order.create({
    clientId,
    status: "pending",
    totalAmount: 0,
  });

  let total = 0;

  for (const item of selectedItems) {
    const product = await Product.findById(item.productId);

    if (!product || product.stock < item.quantity)
      throw createError(400, "Stock issue during checkout.");

    total += product.price * item.quantity;

    await OrderItem.create({
      orderId: order._id,
      productId: product._id,
      shopId: product.shopId,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    });

    product.stock -= item.quantity;
    await product.save();
  }

  order.totalAmount = total;
  await order.save();

  // Remove purchased items from cart
  cart.items = cart.items.filter(
    (item) =>
      !selectedItems.some(
        (selected) =>
          selected.productId.toString() === item.productId.toString()
      )
  );

  await cart.save();

  return order;
};

module.exports = {
  addToCart,
  getCart,
  checkout,
};