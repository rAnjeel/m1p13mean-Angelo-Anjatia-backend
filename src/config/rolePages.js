const ROLE_PAGES = {
  client: [
    "/admin/dashboard",
    "/admin/shops",
    "/admin/categories",
    "/admin/users",
  ],
  shopkeeper: [
    "/shopkeeper/products",
    "/admin/categories",
  ],
  admin: [
    "/admin/dashboard",
    "/admin/shops",
    "/admin/categories",
    "/admin/users",
  ]
};

const getPagesByRole = (role) => {
  const normalizedRole = (role || "").trim().toLowerCase();
  return ROLE_PAGES[normalizedRole] || [];
};

module.exports = {
  ROLE_PAGES,
  getPagesByRole,
};
