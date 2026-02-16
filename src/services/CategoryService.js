const Category = require("../models/Category");

const createError = (status, message, details) => {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
};

const normalizeMongoError = (error) => {
  if (error?.status) {
    return error;
  }

  if (error?.name === "ValidationError") {
    return createError(400, "Validation failed.", error.errors);
  }

  if (error?.name === "CastError") {
    return createError(400, `Invalid ${error.path}.`, { value: error.value });
  }

  return createError(500, "Unexpected server error.");
};

// CREATE
const createCategory = async (data) => {
  try {
    return await Category.create(data);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ ALL
const getAllCategories = async () => {
  try {
    return await Category.find();
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ BY TYPE
const getCategoriesByType = async (type) => {
  try {
    return await Category.find({ type });
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ BY ID
const getCategoryById = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw createError(404, "Category not found.");
    }
    return category;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// UPDATE
const updateCategory = async (categoryId, updates) => {
  try {
    const category = await Category.findByIdAndUpdate(categoryId, updates, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!category) {
      throw createError(404, "Category not found.");
    }
    return category;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// DELETE
const deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      throw createError(404, "Category not found.");
    }
    return category;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoriesByType,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
