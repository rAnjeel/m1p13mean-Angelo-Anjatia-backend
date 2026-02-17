const ROLE_PAGES = {
  client: [
    "/home",
    "/shops",
    "/products",
    "/profile",
    "/orders",
  ],
  shopkeeper: [
    "/dashboard",
    "/users",
    "/shops/manage",
    "/categories/manage",
    "/products/manage",
    "/stock-movements",
    "/profile",
  ],
};

const getPagesByRole = (role) => {
  const normalizedRole = (role || "").trim().toLowerCase();
  return ROLE_PAGES[normalizedRole] || [];
};

module.exports = {
  ROLE_PAGES,
  getPagesByRole,
};
