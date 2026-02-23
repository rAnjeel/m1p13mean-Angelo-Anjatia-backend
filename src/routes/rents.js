const express = require("express");
const { getRentsByShop, payRent } = require("../controllers/rentController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();

router.use(authenticateToken, requireRole("shopkeeper", "admin"));

// GET /api/rents/shop/:shopId
router.get("/shop/:shopId", getRentsByShop);

// PUT /api/rents/:id/pay
router.put("/:id/pay", payRent);

module.exports = router;