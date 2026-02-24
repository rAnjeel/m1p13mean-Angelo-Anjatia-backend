const express = require("express");
// const { getRentsByShop, payRent } = require("../controllers/rentController");
const { getRentsByShop, payRent, getUnpaidRentsByMonthYear} = require("../controllers/rentController");
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

module.exports = router;