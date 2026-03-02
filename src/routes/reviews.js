const express = require("express");
const { addReview, getReviewsByProduct, deleteReview } = require("../controllers/reviewController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();

router.post("/:productId", authenticateToken, requireRole("client"), addReview);
router.get("/:productId", getReviewsByProduct);
router.delete("/:reviewId", authenticateToken, requireRole("shopkeeper", "admin"), deleteReview);

module.exports = router;
