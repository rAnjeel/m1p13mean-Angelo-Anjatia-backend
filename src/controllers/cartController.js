const CartService = require("../services/CartService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
  });
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const result = await CartService.addToCart(
      req.user.sub,
      productId,
      quantity
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const getCart = async (req, res) => {
  try {
    const items = await CartService.getCartByShop(
      req.user.sub,
      req.params.shopId
    );
    return res.status(200).json({ items });
  } catch (error) {
    return handleError(res, error);
  }
};

const checkout = async (req, res) => {
  try {
    const order = await CartService.checkoutCart(
      req.user.sub,
      req.params.shopId,
      req.body.selectedProductIds || []
    );
    return res.status(200).json({ message: "Order created", order });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  addToCart,
  getCart,
  checkout,
};