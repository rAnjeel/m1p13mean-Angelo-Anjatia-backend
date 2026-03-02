const revokedTokens = new Map();

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const revokeToken = (token, exp) => {
  if (!token || typeof token !== "string") {
    return;
  }

  const expiration = Number(exp);
  if (!Number.isFinite(expiration)) {
    return;
  }

  revokedTokens.set(token, expiration);
};

const isTokenRevoked = (token) => {
  if (!token || typeof token !== "string") {
    return false;
  }

  const expiration = revokedTokens.get(token);
  if (!expiration) {
    return false;
  }

  if (expiration <= nowInSeconds()) {
    revokedTokens.delete(token);
    return false;
  }

  return true;
};

const cleanupExpiredRevokedTokens = () => {
  const now = nowInSeconds();
  for (const [token, expiration] of revokedTokens.entries()) {
    if (expiration <= now) {
      revokedTokens.delete(token);
    }
  }
};

const cleanupTimer = setInterval(cleanupExpiredRevokedTokens, 60 * 1000);
cleanupTimer.unref();

module.exports = {
  revokeToken,
  isTokenRevoked,
};
