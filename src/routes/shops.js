const express = require("express");
const {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
} = require("../controllers/shopController");

const router = express.Router();

// POST /api/shops
router.post("/", createShop);

// GET /api/shops
router.get("/", getAllShops);

// GET /api/shops/:id
router.get("/:id", getShopById);

// PUT /api/shops/:id
router.put("/:id", updateShop);

// DELETE /api/shops/:id
router.delete("/:id", deleteShop);

module.exports = router;
