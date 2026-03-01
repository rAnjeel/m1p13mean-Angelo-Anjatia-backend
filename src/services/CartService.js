const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * 🛒 Ajouter au panier
 */
const addToCart = async (clientId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product) throw createError(404, "Product not found.");

  if (!product.isActive) {
    throw createError(400, "Product is not available.");
  }

  let cart = await Cart.findOne({
    clientId,
    shopId: product.shopId,
  });

  if (!cart) {
    cart = await Cart.create({
      clientId,
      shopId: product.shopId,
    });
  }

  let cartItem = await CartItem.findOne({
    cartId: cart._id,
    productId,
  });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    await CartItem.create({
      cartId: cart._id,
      productId,
      quantity,
    });
  }

  return { message: "Product added to cart." };
};

/**
 * 🛍 Voir panier d'une boutique
 */
const getCartByShop = async (clientId, shopId) => {
  const cart = await Cart.findOne({ clientId, shopId });
  if (!cart) return [];

  return await CartItem.find({ cartId: cart._id }).populate("productId");
};

/**
 * 🧾 Checkout (crée Order en pending)
 * ⚠️ IMPORTANT : NE MODIFIE PAS LE STOCK
 */
const checkoutCart = async (clientId, shopId, selectedProductIds = []) => {
  const cart = await Cart.findOne({ clientId, shopId });
  if (!cart) throw createError(404, "Cart not found.");

  let items = await CartItem.find({ cartId: cart._id }).populate("productId");

  // Si sélection spécifique
  if (selectedProductIds.length > 0) {
    items = items.filter((item) =>
      selectedProductIds.includes(item.productId._id.toString())
    );
  }

  if (items.length === 0) {
    throw createError(400, "No items selected for checkout.");
  }

  // ✅ Création Order (pending)
  const order = await Order.create({
    clientId,
    status: "pending",
    totalAmount: 0,
  });

  let total = 0;

  for (const item of items) {
    // ❌ On ne vérifie PAS le stock ici
    // ❌ On ne diminue PAS le stock ici

    const amount = item.productId.price * item.quantity;
    total += amount;

    await OrderItem.create({
      orderId: order._id,
      productId: item.productId._id,
      shopId,
      quantity: item.quantity,
      priceAtPurchase: item.productId.price,
    });

    // 🧹 Supprimer du panier
    await CartItem.findByIdAndDelete(item._id);
  }

  order.totalAmount = total;
  await order.save();

  return order;
};

module.exports = {
  addToCart,
  getCartByShop,
  checkoutCart,
};