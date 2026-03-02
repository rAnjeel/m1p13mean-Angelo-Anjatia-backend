const DashboardService = require("../services/DashboardService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
  });
};

// GET total shops
const getTotalShops = async (_req, res) => {
  try {
    const total = await DashboardService.getTotalShops();
    return res.status(200).json({
      totalShops: total,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET shops grouped by category
const getShopsByCategory = async (_req, res) => {
  try {
    const data = await DashboardService.getShopsByCategory();
    return res.status(200).json({
      shopsByCategory: data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET total users
const getTotalUser = async (_req, res) => {
  try {
    const total = await DashboardService.getTotalUser();
    return res.status(200).json({
      totalUsers: total,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET total revenue
const getTotalRevenue = async (_req, res) => {
  try {
    const total = await DashboardService.getTotalRevenue();
    return res.status(200).json({
      totalRevenue: total,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET total users created by day (last N days)
const getTotalUserDaily = async (req, res) => {
  try {
    const { limit } = req.query;
    const total = await DashboardService.getLastDaysStats(limit);
    return res.status(200).json({
      totalUsersDaily: total,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET total users created by month (last N months)
const getTotalUserMonthly = async (req, res) => {
  try {
    const { limit } = req.query;
    const total = await DashboardService.getLastMonthsStats(limit);
    return res.status(200).json({
      totalUsersMonthly: total,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  getTotalShops,
  getShopsByCategory,
  getTotalUser,
  getTotalRevenue,
  getTotalUserDaily,
  getTotalUserMonthly,
};
