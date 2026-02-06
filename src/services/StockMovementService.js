const StockMovement = require("../models/StockMovement");
const Product = require("../models/Product");
const Shop = require("../models/Shop");

const createError = (status, message, details) => {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
};

const normalizeMongoError = (error) => {
  if (error?.name === "ValidationError") {
    return createError(400, "Validation failed.", error.errors);
  }

  if (error?.name === "CastError") {
    return createError(400, `Invalid ${error.path}.`, { value: error.value });
  }

  return createError(500, "Unexpected server error.");
};

const ensureProductExists = async (productId) => {
  const product = await Product.findById(productId).select("_id stock");
  if (!product) {
    throw createError(404, "Product not found.");
  }
  return product;
};

const ensureShopExists = async (shopId) => {
  const shop = await Shop.findById(shopId).select("_id");
  if (!shop) {
    throw createError(404, "Shop not found.");
  }
};

// CREATE
const createStockMovement = async (data) => {
  try {
    const product = await ensureProductExists(data.productId);
    await ensureShopExists(data.shopId);

    return await StockMovement.create({
      ...data,
      stockBefore: product.stock,
      stockAfter: data.stockAfter,
    });
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ ALL
const getAllStockMovements = async () => {
  try {
    return await StockMovement.find()
      .populate("productId", "name")
      .populate("shopId", "name")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ BY PRODUCT
const getStockMovementsByProduct = async (productId) => {
  try {
    return await StockMovement.find({ productId })
      .populate("productId", "name")
      .populate("shopId", "name")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// DELETE
const deleteStockMovement = async (id) => {
  try {
    const movement = await StockMovement.findByIdAndDelete(id);
    if (!movement) {
      throw createError(404, "Stock movement not found.");
    }
    return movement;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

module.exports = {
  createStockMovement,
  getAllStockMovements,
  getStockMovementsByProduct,
  deleteStockMovement,
};
