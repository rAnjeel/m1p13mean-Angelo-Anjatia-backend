const express = require("express");
const {
  addToCart,
  getCart,
  checkout,
} = require("../controllers/cartController");
const { authenticateToken } = require("../middlewares/authenticateToken");

const router = express.Router();

router.use(authenticateToken);

// POST /api/carts/add
router.post("/add", addToCart);

// GET /api/carts/:shopId
router.get("/:shopId", getCart);

// POST /api/carts/:shopId/checkout
router.post("/:shopId/checkout", checkout);

module.exports = router;