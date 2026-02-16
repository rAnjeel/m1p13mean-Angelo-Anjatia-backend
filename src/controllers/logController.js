const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "../../logs");

const getLogs = (req, res) => {
  const { action } = req.query;

  const today = new Date().toISOString().slice(0, 10);
  const filePath = path.join(LOG_DIR, `shop-${today}.log`);

  if (!fs.existsSync(filePath)) {
    return res.status(200).json({ logs: [] });
  }

  const content = fs.readFileSync(filePath, "utf8").split("\n");

  let logs = content.filter((line) => line.trim() !== "");

  if (action) {
    logs = logs.filter((line) => line.includes(action.toUpperCase()));
  }

  return res.status(200).json({ logs });
};

module.exports = {
  getLogs,
};
