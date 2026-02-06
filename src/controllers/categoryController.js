const CategoryService = require("../services/CategoryService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
    details: error.details,
  });
};

const validateCreateFields = ({ name, type }) => {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Category name must be at least 2 characters.");
  }

  if (!type || !["shop", "product"].includes(type)) {
    errors.push('Type must be "shop" or "product".');
  }

  return errors;
};

// CREATE
const createCategory = async (req, res) => {
  try {
    const errors = validateCreateFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const category = await CategoryService.createCategory(req.body);
    return res.status(201).json({
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// READ ALL
const getAllCategories = async (_req, res) => {
  try {
    const categories = await CategoryService.getAllCategories();
    return res.status(200).json({ categories });
  } catch (error) {
    return handleError(res, error);
  }
};

// READ BY TYPE
const getCategoriesByType = async (req, res) => {
  try {
    const categories = await CategoryService.getCategoriesByType(
      req.params.type
    );
    return res.status(200).json({ categories });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoriesByType,
};
