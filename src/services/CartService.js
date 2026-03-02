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
 * Add product to cart.
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
 * Get all carts for a client grouped by shop.
 */
const getClientCartsByShop = async (clientId) => {
  const carts = await Cart.find({ clientId })
    .populate("shopId", "name")
    .sort({ createdAt: -1 });

  const cartSummaries = await Promise.all(
    carts.map(async (cart) => {
      const items = await CartItem.find({ cartId: cart._id }).populate("productId");

      const validItems = items.filter((item) => item.productId);
      const totalItems = validItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const totalAmount = validItems.reduce((sum, item) => {
        const price = Number(item?.productId?.price || 0);
        return sum + price * Number(item.quantity || 0);
      }, 0);

      return {
        cartId: String(cart._id),
        shopId: String(cart?.shopId?._id || cart.shopId || ""),
        shopName: cart?.shopId?.name || "Boutique",
        items: validItems,
        totalItems,
        totalAmount,
      };
    })
  );

  return cartSummaries.filter((cart) => cart.items.length > 0);
};

/**
 * Get one cart for one shop.
 */
const getCartByShop = async (clientId, shopId) => {
  const cart = await Cart.findOne({ clientId, shopId });
  if (!cart) return [];

  return await CartItem.find({ cartId: cart._id }).populate("productId");
};

/**
 * Checkout selected items (or all if none selected).
 * Does not update stock.
 */
const checkoutCart = async (clientId, shopId, selectedProductIds = []) => {
  const cart = await Cart.findOne({ clientId, shopId });
  if (!cart) throw createError(404, "Cart not found.");

  let items = await CartItem.find({ cartId: cart._id }).populate("productId");

  if (selectedProductIds.length > 0) {
    items = items.filter((item) =>
      selectedProductIds.includes(item.productId._id.toString())
    );
  }

  if (items.length === 0) {
    throw createError(400, "No items selected for checkout.");
  }

  const order = await Order.create({
    clientId,
    status: "pending",
    totalAmount: 0,
  });

  let total = 0;

  for (const item of items) {
    const amount = item.productId.price * item.quantity;
    total += amount;

    await OrderItem.create({
      orderId: order._id,
      productId: item.productId._id,
      productName: item.productId.name || "",
      shopId,
      quantity: item.quantity,
      priceAtPurchase: item.productId.price,
    });
  }

  order.totalAmount = total;
  await order.save();

  return order;
};

/**
 * Update quantity for one cart item.
 */
const updateCartItemQuantity = async (clientId, itemId, quantity) => {
  const normalizedQuantity = Number(quantity);
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
    throw createError(400, "Quantity must be an integer greater than 0.");
  }

  const cartItem = await CartItem.findById(itemId);
  if (!cartItem) {
    throw createError(404, "Cart item not found.");
  }

  const ownerCart = await Cart.findOne({
    _id: cartItem.cartId,
    clientId,
  });
  if (!ownerCart) {
    throw createError(403, "Forbidden cart item access.");
  }

  cartItem.quantity = normalizedQuantity;
  await cartItem.save();

  return { message: "Cart item quantity updated.", item: cartItem };
};

/**
 * Remove one cart item from a client cart.
 */
const removeCartItem = async (clientId, itemId) => {
  const cartItem = await CartItem.findById(itemId);
  if (!cartItem) {
    throw createError(404, "Cart item not found.");
  }

  const ownerCart = await Cart.findOne({
    _id: cartItem.cartId,
    clientId,
  });
  if (!ownerCart) {
    throw createError(403, "Forbidden cart item access.");
  }

  await CartItem.findByIdAndDelete(itemId);

  const remaining = await CartItem.countDocuments({ cartId: ownerCart._id });
  if (remaining === 0) {
    await Cart.findByIdAndDelete(ownerCart._id);
  }

  return { message: "Cart item removed." };
};

module.exports = {
  addToCart,
  getClientCartsByShop,
  getCartByShop,
  checkoutCart,
  updateCartItemQuantity,
  removeCartItem,
};
