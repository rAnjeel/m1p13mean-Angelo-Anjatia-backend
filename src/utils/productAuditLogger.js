const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "../../logs/product");

const ensureLogDirExists = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

const getLogFilePath = () => {
  const today = new Date().toISOString().slice(0, 10);
  return path.join(LOG_DIR, `${today}.log`);
};

const formatDateTime = () => {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
};

const writeProductAuditLog = ({
  userEmail,
  action,
  productName,
  details = "",
}) => {
  ensureLogDirExists();

  const line = `[${formatDateTime()}] ${userEmail} ${action} product "${productName}" ${details}\n`;

  fs.appendFileSync(getLogFilePath(), line, "utf8");
};

module.exports = {
  writeProductAuditLog,
};
