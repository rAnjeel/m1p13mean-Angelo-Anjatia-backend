const express = require("express");
const {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
  addShopImages,
  removeShopImage,
} = require("../controllers/shopController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");
const shopImageUpload = require("../middlewares/shopImageUpload");

const router = express.Router();

const handleShopImageUpload = (req, res, next) => {
  const uploadMiddleware = shopImageUpload.array("images", 5);

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

// POST /api/shops
router.post("/", authenticateToken, requireRole("shopkeeper", "admin"), createShop);

// POST /api/shops/:id/images
router.post(
  "/:id/images",
  authenticateToken,
  requireRole("shopkeeper", "admin"),
  handleShopImageUpload,
  addShopImages
);

// GET /api/shops
router.get("/", getAllShops);

// GET /api/shops/:id
router.get("/:id", getShopById);

// PUT /api/shops/:id
router.put("/:id", authenticateToken, requireRole("shopkeeper", "admin"), updateShop);

// DELETE /api/shops/:id
router.delete("/:id", authenticateToken, requireRole("shopkeeper", "admin"), deleteShop);

// DELETE /api/shops/:shopId/images/:publicId
router.delete(
  "/:shopId/images/:publicId",
  authenticateToken,
  requireRole("shopkeeper", "admin"),
  removeShopImage
);

module.exports = router;
