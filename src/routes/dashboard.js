const express = require("express");
const {
  getTotalShops,
  getShopsByCategory,
  getTotalUser,
  getTotalRevenue,
  getTotalUserDaily,
  getTotalUserMonthly,
} = require("../controllers/dashboardController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();
router.use(authenticateToken, requireRole("admin", "shopkeeper"));

// GET /api/dashboard/shops/total
router.get("/shops/total", getTotalShops);

// GET /api/dashboard/shops/by-category
router.get("/shops/by-category", getShopsByCategory);

// GET /api/dashboard/users/total
router.get("/users/total", getTotalUser);

// GET /api/dashboard/revenue/total
router.get("/revenue/total", getTotalRevenue);

// GET /api/dashboard/users/daily?limit=5
router.get("/users/daily", getTotalUserDaily);

// GET /api/dashboard/users/monthly?limit=5
router.get("/users/monthly", getTotalUserMonthly);

module.exports = router;
