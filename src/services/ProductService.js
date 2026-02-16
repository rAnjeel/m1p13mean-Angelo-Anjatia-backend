const Product = require("../models/Product");
const Shop = require("../models/Shop");
const Category = require("../models/Category");

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

  if (error?.code === 11000) {
    return createError(409, "Duplicate value.", error.keyValue);
  }

  if (error?.name === "CastError") {
    return createError(400, `Invalid ${error.path}.`, { value: error.value });
  }

  return createError(500, "Unexpected server error.");
};

const ensureShopExists = async (shopId) => {
  if (!shopId) return;
  const shop = await Shop.findById(shopId).select("_id");
  if (!shop) {
    throw createError(404, "Shop not found.");
  }
};

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) return;
  const category = await Category.findById(categoryId).select("_id");
  if (!category) {
    throw createError(404, "Category not found.");
  }
};

// CREATE
const createProduct = async (productData) => {
  try {
    await ensureShopExists(productData.shopId);
    await ensureCategoryExists(productData.categoryId);
    return await Product.create(productData);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ ALL
const getAllProducts = async () => {
  try {
    return await Product.find().populate("shopId", "name merchantId categoryId");
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ BY ID
const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId).populate(
      "shopId",
      "name merchantId categoryId"
    );

    if (!product) {
      throw createError(404, "Product not found.");
    }

    return product;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// UPDATE
const updateProduct = async (productId, updates) => {
  try {
    if (updates?.shopId) {
      await ensureShopExists(updates.shopId);
    }
    if (updates?.categoryId) {
      await ensureCategoryExists(updates.categoryId);
    }

    const product = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!product) {
      throw createError(404, "Product not found.");
    }

    return product;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// DELETE
const deleteProduct = async (productId) => {
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw createError(404, "Product not found.");
    }
    return product;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
