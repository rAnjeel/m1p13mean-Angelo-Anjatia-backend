const express = require("express");
const {
  addToCart,
  getCart,
  getMyCarts,
  checkout,
  updateItemQuantity,
  removeItem,
} = require("../controllers/cartController");
const { authenticateToken } = require("../middlewares/authenticateToken");

const router = express.Router();

router.use(authenticateToken);

// GET /api/carts
router.get("/", getMyCarts);

// POST /api/carts/add
router.post("/add", addToCart);

// PATCH /api/carts/items/:itemId
router.patch("/items/:itemId", updateItemQuantity);

// DELETE /api/carts/items/:itemId
router.delete("/items/:itemId", removeItem);

// GET /api/carts/:shopId
router.get("/:shopId", getCart);

// POST /api/carts/:shopId/checkout
router.post("/:shopId/checkout", checkout);

module.exports = router;
