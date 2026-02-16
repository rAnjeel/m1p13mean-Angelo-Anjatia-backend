const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// POST /api/products
router.post("/", createProduct);

// GET /api/products
router.get("/", getAllProducts);

// GET /api/products/:id
router.get("/:id", getProductById);

// PUT /api/products/:id
router.put("/:id", updateProduct);

// DELETE /api/products/:id
router.delete("/:id", deleteProduct);

module.exports = router;
