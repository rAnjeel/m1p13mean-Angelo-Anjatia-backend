const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "../../logs");

// créer dossier logs s'il n'existe pas
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

const getTodayFileName = () => {
  const today = new Date().toISOString().slice(0, 10);
  return path.join(LOG_DIR, `shop-${today}.log`);
};

const writeLog = (entry) => {
  const filePath = getTodayFileName();
  const timestamp = new Date().toISOString();

  const logLine = `[${timestamp}] ${entry}\n`;

  fs.appendFileSync(filePath, logLine, "utf8");
};

module.exports = {
  writeLog,
};
