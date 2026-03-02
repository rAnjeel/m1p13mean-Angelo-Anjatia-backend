const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { payOrder, getMyOrders } = require("../controllers/orderController");

const router = express.Router();

router.use(authenticateToken);

// GET /api/orders/my
router.get("/my", getMyOrders);

// PUT /api/orders/:id/pay
router.put("/:id/pay", payOrder);

module.exports = router;
