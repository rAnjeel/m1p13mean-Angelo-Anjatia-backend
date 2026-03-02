const express = require("express");
// const { getRentsByShop, payRent } = require("../controllers/rentController");
const {
  getRentsByShop,
  payRent,
  getUnpaidRentsByMonthYear,
  getPaidRentsHistory,
} = require("../controllers/rentController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");


const router = express.Router();

router.use(authenticateToken, requireRole("shopkeeper", "admin"));

// GET /api/rents/shop/:shopId
router.get("/shop/:shopId", getRentsByShop);

// PUT /api/rents/:id/pay
router.put("/:id/pay", payRent);

// GET /api/rents/unpaid?month=5&year=2026
router.get("/unpaid", requireRole("admin"), getUnpaidRentsByMonthYear);

// GET /api/rents/paid?limit=100
router.get("/paid", requireRole("admin"), getPaidRentsHistory);

module.exports = router;
