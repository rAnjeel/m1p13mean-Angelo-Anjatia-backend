const CartService = require("../services/CartService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
  });
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await CartService.addToCart(
      req.user.sub,
      productId,
      quantity
    );

    return res.status(200).json({
      message: "Product added to cart.",
      cart,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await CartService.getCart(req.user.sub);
    return res.status(200).json({ cart });
  } catch (error) {
    return handleError(res, error);
  }
};

const checkout = async (req, res) => {
  try {
    const { productIds } = req.body;

    const order = await CartService.checkout(
      req.user.sub,
      productIds || []
    );

    return res.status(201).json({
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  addToCart,
  getCart,
  checkout,
};