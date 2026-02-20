const { verifyJwt } = require("../utils/jwt");
const { isTokenRevoked } = require("../utils/revokedTokenStore");

const authenticateToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return res.status(401).json({
      message: "Missing Authorization header.",
    });
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization header must use Bearer token.",
    });
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({
      message: "Bearer token is missing.",
    });
  }

  try {
    const payload = verifyJwt(token);
    if (isTokenRevoked(token)) {
      return res.status(401).json({
        message: "Token has been revoked. Please log in again.",
      });
    }

    req.user = payload;
    req.token = token;
    return next();
  } catch (_error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = {
  authenticateToken,
};
