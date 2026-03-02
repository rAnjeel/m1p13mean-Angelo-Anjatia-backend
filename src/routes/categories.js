const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoriesByType,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();

// POST /api/categories
router.post("/", authenticateToken, requireRole("shopkeeper", "admin"), createCategory);

// GET /api/categories
router.get("/", getAllCategories);

// GET /api/categories/type/:type
router.get("/type/:type", getCategoriesByType);

// GET /api/categories/:id
router.get("/:id", getCategoryById);

// PUT /api/categories/:id
router.put("/:id", authenticateToken, requireRole("shopkeeper", "admin"), updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", authenticateToken, requireRole("shopkeeper", "admin"), deleteCategory);

module.exports = router;
