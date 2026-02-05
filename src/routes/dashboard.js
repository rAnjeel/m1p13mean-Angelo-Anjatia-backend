const express = require("express");
const {
  getTotalShops,
  getShopsByCategory,
} = require("../controllers/dashboardController");

const router = express.Router();

// GET /api/dashboard/shops/total
router.get("/shops/total", getTotalShops);

// GET /api/dashboard/shops/by-category
router.get("/shops/by-category", getShopsByCategory);

module.exports = router;
