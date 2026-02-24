const express = require("express");
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");

const router = express.Router();

router.use(authenticateToken, requireRole("client"));

router.post("/:shopId", addFavorite);
router.delete("/:shopId", removeFavorite);
router.get("/", getFavorites);

module.exports = router;