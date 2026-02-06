const StockMovementService = require("../services/StockMovementService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
    details: error.details,
  });
};

const validateCreateFields = ({
  productId,
  shopId,
  type,
  quantity,
  stockAfter,
}) => {
  const errors = [];

  if (!productId) errors.push("productId is required.");
  if (!shopId) errors.push("shopId is required.");

  if (!type || !["IN", "OUT", "RESERVE", "RELEASE", "ADJUST"].includes(type)) {
    errors.push("Invalid stock movement type.");
  }

  if (quantity === undefined || Number(quantity) <= 0) {
    errors.push("quantity must be greater than 0.");
  }

  if (stockAfter === undefined || Number(stockAfter) < 0) {
    errors.push("stockAfter must be >= 0.");
  }

  return errors;
};

// CREATE
const createStockMovement = async (req, res) => {
  try {
    const errors = validateCreateFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const movement = await StockMovementService.createStockMovement(req.body);
    return res.status(201).json({
      message: "Stock movement created successfully.",
      movement,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// READ ALL
const getAllStockMovements = async (_req, res) => {
  try {
    const movements = await StockMovementService.getAllStockMovements();
    return res.status(200).json({ movements });
  } catch (error) {
    return handleError(res, error);
  }
};

// READ BY PRODUCT
const getStockMovementsByProduct = async (req, res) => {
  try {
    const movements =
      await StockMovementService.getStockMovementsByProduct(
        req.params.productId
      );
    return res.status(200).json({ movements });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE
const deleteStockMovement = async (req, res) => {
  try {
    const movement = await StockMovementService.deleteStockMovement(
      req.params.id
    );
    return res.status(200).json({
      message: "Stock movement deleted successfully.",
      movement,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createStockMovement,
  getAllStockMovements,
  getStockMovementsByProduct,
  deleteStockMovement,
};
