const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();

// POST /api/products
router.post("/", authenticateToken, requireRole("shopkeeper"), createProduct);

// GET /api/products
router.get("/", getAllProducts);

// GET /api/products/:id
router.get("/:id", getProductById);

// PUT /api/products/:id
router.put("/:id", authenticateToken, requireRole("shopkeeper"), updateProduct);

// DELETE /api/products/:id
router.delete("/:id", authenticateToken, requireRole("shopkeeper"), deleteProduct);

module.exports = router;
