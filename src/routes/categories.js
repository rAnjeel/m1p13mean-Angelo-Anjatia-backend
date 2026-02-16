const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoriesByType,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// POST /api/categories
router.post("/", createCategory);

// GET /api/categories
router.get("/", getAllCategories);

// GET /api/categories/type/:type
router.get("/type/:type", getCategoriesByType);

// GET /api/categories/:id
router.get("/:id", getCategoryById);

// PUT /api/categories/:id
router.put("/:id", updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

module.exports = router;
