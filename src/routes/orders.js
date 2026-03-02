const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { payOrder } = require("../controllers/orderController");

const router = express.Router();

router.use(authenticateToken);

// 💳 PUT /api/orders/:id/pay
router.put("/:id/pay", payOrder);

module.exports = router;