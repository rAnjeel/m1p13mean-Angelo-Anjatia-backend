const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoriesByType,
} = require("../controllers/categoryController");

const router = express.Router();

// POST /api/categories
router.post("/", createCategory);

// GET /api/categories
router.get("/", getAllCategories);

// GET /api/categories/type/:type
router.get("/type/:type", getCategoriesByType);

module.exports = router;
