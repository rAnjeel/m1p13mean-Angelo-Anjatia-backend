const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserAvatar,
  removeUserAvatar,
} = require("../controllers/userController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const { requireRole } = require("../middlewares/roleGuard");
const avatarUpload = require("../middlewares/avatarUpload");

const router = express.Router();
router.use(authenticateToken, requireRole("shopkeeper", "admin"));

// POST /api/users
router.post("/", createUser);

// GET /api/users
router.get("/", getAllUsers);

// GET /api/users/:id
router.get("/:id", getUserById);

// PUT /api/users/:id
router.put("/:id", updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

// POST /api/users/:id/avatar
router.post("/:id/avatar", avatarUpload.single("avatar"), updateUserAvatar);

// DELETE /api/users/:id/avatar
router.delete("/:id/avatar", removeUserAvatar);

module.exports = router;
