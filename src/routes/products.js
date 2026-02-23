const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductImages,
  removeProductImage,
} = require("../controllers/productController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");
const productImageUpload = require("../middlewares/productImageUpload");

const router = express.Router();

const handleProductImageUpload = (req, res, next) => {
  const uploadMiddleware = productImageUpload.array("images", 5);

  uploadMiddleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const status = error.name === "MulterError" ? 400 : 415;
    res.status(status).json({
      message: error.message || "Invalid image upload payload.",
    });
  });
};

// POST /api/products
router.post("/", authenticateToken, requireRole("shopkeeper"), createProduct);

// POST /api/products/:id/images
router.post(
  "/:id/images",
  authenticateToken,
  requireRole("shopkeeper"),
  handleProductImageUpload,
  addProductImages
);

// GET /api/products
router.get("/", getAllProducts);

// GET /api/products/:id
router.get("/:id", getProductById);

// PUT /api/products/:id
router.put("/:id", authenticateToken, requireRole("shopkeeper"), updateProduct);

// DELETE /api/products/:id
router.delete("/:id", authenticateToken, requireRole("shopkeeper"), deleteProduct);

// DELETE /api/products/:productId/images/:publicId
router.delete(
  "/:productId/images/:publicId",
  authenticateToken,
  requireRole("shopkeeper"),
  removeProductImage
);

module.exports = router;
