const express = require("express");
const {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
} = require("../controllers/shopController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();

// POST /api/shops
router.post("/", authenticateToken, requireRole("shopkeeper"), createShop);

// GET /api/shops
router.get("/", getAllShops);

// GET /api/shops/:id
router.get("/:id", getShopById);

// PUT /api/shops/:id
router.put("/:id", authenticateToken, requireRole("shopkeeper"), updateShop);

// DELETE /api/shops/:id
router.delete("/:id", authenticateToken, requireRole("shopkeeper"), deleteShop);

module.exports = router;
