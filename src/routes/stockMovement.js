const express = require("express");
const {
  createStockMovement,
  getAllStockMovements,
  getStockMovementsByProduct,
  deleteStockMovement,
} = require("../controllers/stockMovementController");

const router = express.Router();

// POST /api/stock-movements
router.post("/", createStockMovement);

// GET /api/stock-movements
router.get("/", getAllStockMovements);

// GET /api/stock-movements/product/:productId
router.get("/product/:productId", getStockMovementsByProduct);

// DELETE /api/stock-movements/:id
router.delete("/:id", deleteStockMovement);

module.exports = router;
