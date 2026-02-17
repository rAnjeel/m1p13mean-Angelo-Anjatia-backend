const VALID_ROLES = ["client", "shopkeeper"];

const requireRole = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map((role) => role.trim().toLowerCase());

  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || typeof userRole !== "string") {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const normalizedUserRole = userRole.trim().toLowerCase();

    if (!VALID_ROLES.includes(normalizedUserRole)) {
      return res.status(400).json({
        message: `Invalid role "${userRole}". Allowed roles are: ${VALID_ROLES.join(", ")}.`,
      });
    }

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({
        message: "Access denied for this role.",
      });
    }

    req.userRole = normalizedUserRole;
    return next();
  };
};

module.exports = {
  requireRole,
};
