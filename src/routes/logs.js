const express = require("express");
const { getLogs } = require("../controllers/logController");

const router = express.Router();

// GET /api/logs?action=PUT
router.get("/", getLogs);

module.exports = router;
