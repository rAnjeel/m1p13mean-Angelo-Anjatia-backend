const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "..", "logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const getTodayFileName = () => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `shop-audit-${today}.log`);
};

const writeShopAuditLog = ({
  action,
  userName,
  userId,
  shopName,
  shopId,
  details,
}) => {
  const timestamp = new Date().toISOString();

  const logLine = `[${timestamp}] [${action}] user="${userName}" userId="${userId}" shop="${shopName}" shopId="${shopId}" details="${details || ""}"\n`;

  fs.appendFileSync(getTodayFileName(), logLine, { encoding: "utf8" });
};

module.exports = {
  writeShopAuditLog,
};
