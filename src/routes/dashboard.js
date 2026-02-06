const express = require("express");
const {
  getTotalShops,
  getShopsByCategory,
  getTotalUser,
  getTotalUserDaily,
  getTotalUserMonthly,
} = require("../controllers/dashboardController");

const router = express.Router();

// GET /api/dashboard/shops/total
router.get("/shops/total", getTotalShops);

// GET /api/dashboard/shops/by-category
router.get("/shops/by-category", getShopsByCategory);

// GET /api/dashboard/users/total
router.get("/users/total", getTotalUser);

// GET /api/dashboard/users/daily?limit=5
router.get("/users/daily", getTotalUserDaily);

// GET /api/dashboard/users/monthly?limit=5
router.get("/users/monthly", getTotalUserMonthly);

module.exports = router;
