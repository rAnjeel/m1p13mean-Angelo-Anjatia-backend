const express = require("express");
const {
  addReview,
  getReviewsByShop,
} = require("../controllers/shopReviewController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();

router.post("/:shopId", authenticateToken, requireRole("client"), addReview);
router.get("/:shopId", getReviewsByShop);

module.exports = router;