const express = require("express");
const {
  addToCart,
  getCart,
  checkout,
} = require("../controllers/cartController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();

router.use(authenticateToken, requireRole("client"));

router.post("/", addToCart);
router.get("/", getCart);
router.post("/checkout", checkout);

module.exports = router;