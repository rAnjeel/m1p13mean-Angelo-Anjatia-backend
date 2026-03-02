const OrderService = require("../services/OrderService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
  });
};

const payOrder = async (req, res) => {
  try {
    const result = await OrderService.payOrder(
      req.params.id,
      req.user.sub,
      req.body || {}
    );

    return res.status(200).json({
      message: "Order paid successfully.",
      order: result.order,
      items: result.items,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  payOrder,
};
