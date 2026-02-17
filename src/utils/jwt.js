const crypto = require("crypto");

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 24; // 24 hours

const base64UrlEncode = (value) => {
  return Buffer.from(value).toString("base64url");
};

const base64UrlDecode = (value) => {
  return Buffer.from(value, "base64url").toString("utf8");
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
};

const signJwt = (payload, expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS) => {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const completePayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(completePayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
};

const verifyJwt = (token) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format.");
  }

  const [encodedHeader, encodedPayload, receivedSignature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(data)
    .digest("base64url");

  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature.");
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader));
  if (header.alg !== "HS256") {
    throw new Error("Unsupported token algorithm.");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp !== "number" || payload.exp <= now) {
    throw new Error("Token expired.");
  }

  return payload;
};

module.exports = {
  signJwt,
  verifyJwt,
  DEFAULT_EXPIRES_IN_SECONDS,
};
