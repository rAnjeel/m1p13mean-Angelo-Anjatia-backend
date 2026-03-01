const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "../../logs/shop");

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

const writeShopAuditLog = ({
  userEmail,
  userName,
  action,
  shopName,
  details = "",
}) => {
  try {
    ensureLogDirExists();

    const actor = userEmail || userName || "Unknown";
    const line = `[${formatDateTime()}] ${actor} ${action} shop "${shopName}" ${details}\n`;

    fs.appendFileSync(getLogFilePath(), line, "utf8");
  } catch (error) {
    // Audit log failures must never break API behavior.
    console.error("Shop audit logging failed:", error);
  }
};

module.exports = {
  writeShopAuditLog,
};
// const fs = require("fs");
// const path = require("path");

// const LOG_DIR = path.join(__dirname, "..", "logs");

// if (!fs.existsSync(LOG_DIR)) {
//   fs.mkdirSync(LOG_DIR, { recursive: true });
// }

// const getTodayFileName = () => {
//   const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
//   return path.join(LOG_DIR, `shop-audit-${today}.log`);
// };

// const writeShopAuditLog = ({
//   action,
//   userName,
//   userId,
//   shopName,
//   shopId,
//   details,
// }) => {
//   const timestamp = new Date().toISOString();

//   const logLine = `[${timestamp}] [${action}] user="${userName}" userId="${userId}" shop="${shopName}" shopId="${shopId}" details="${details || ""}"\n`;

//   fs.appendFileSync(getTodayFileName(), logLine, { encoding: "utf8" });
// };

// module.exports = {
//   writeShopAuditLog,
// };
