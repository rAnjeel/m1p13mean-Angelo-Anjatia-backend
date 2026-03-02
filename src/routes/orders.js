const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");
const {
  payOrder,
  getMyOrders,
  getShopkeeperFinancialSummary,
} = require("../controllers/orderController");

const router = express.Router();

router.use(authenticateToken);

// GET /api/orders/my
router.get("/my", getMyOrders);

// GET /api/orders/shopkeeper/financial
router.get("/shopkeeper/financial", requireRole("shopkeeper"), getShopkeeperFinancialSummary);

// PUT /api/orders/:id/pay
router.put("/:id/pay", payOrder);

module.exports = router;
