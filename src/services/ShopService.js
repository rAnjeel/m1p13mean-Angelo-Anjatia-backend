const Shop = require("../models/Shop");
const Category = require("../models/Category");
const User = require("../models/User");

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

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) return;
  const category = await Category.findById(categoryId).select("_id");
  if (!category) {
    throw createError(404, "Category not found.");
  }
};

const ensureMerchantExists = async (merchantId) => {
  if (!merchantId) return;
  const user = await User.findById(merchantId).select("_id");
  if (!user) {
    throw createError(404, "Merchant not found.");
  }
};

// CREATE
const createShop = async (shopData) => {
  try {
    await ensureMerchantExists(shopData.merchantId);
    await ensureCategoryExists(shopData.categoryId);
    return await Shop.create(shopData);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ ALL
const getAllShops = async () => {
  try {
    return await Shop.find()
      .populate("merchantId", "fullName email")
      .populate("categoryId", "name type");
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

//READ BY ID
const getShopById = async (shopId) => {
  try {
    const shop = await Shop.findById(shopId)
      .populate("merchantId", "fullName email")
      .populate("categoryId", "name type");

    if (!shop) {
      throw createError(404, "Shop not found.");
    }
    return shop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};


// UPDATE
const updateShop = async (shopId, updates) => {
  try {
    if (updates?.merchantId) {
      await ensureMerchantExists(updates.merchantId);
    }
    if (updates?.categoryId) {
      await ensureCategoryExists(updates.categoryId);
    }

    const shop = await Shop.findByIdAndUpdate(shopId, updates, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!shop) {
      throw createError(404, "Shop not found.");
    }

    return shop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// DELETE
const deleteShop = async (shopId) => {
  try {
    const shop = await Shop.findByIdAndDelete(shopId);
    if (!shop) {
      throw createError(404, "Shop not found.");
    }
    return shop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
};
