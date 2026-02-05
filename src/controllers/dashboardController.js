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

module.exports = {
  getTotalShops,
  getShopsByCategory,
};
