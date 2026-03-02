const ROLE_PAGES = {
  client: [
    "/profile/about",
  ],
  shopkeeper: [
    "/shopkeeper/my-shop",
    "/shopkeeper/products",
    "/admin/categories",
    "/profile/about",
  ],
  admin: [
    "/admin/dashboard",
    "/admin/shops",
    "/admin/categories",
    "/admin/users",
    "/profile/about",
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
