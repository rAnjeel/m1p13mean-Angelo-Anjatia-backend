const RentService = require("../services/RentService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
  });
};

// GET rents of a shop
const getRentsByShop = async (req, res) => {
  try {
    const rents = await RentService.getRentsByShop(req.params.shopId);
    return res.status(200).json({ rents });
  } catch (error) {
    return handleError(res, error);
  }
};

// PAY rent
const payRent = async (req, res) => {
  try {
    const rent = await RentService.payRent(req.params.id);
    return res.status(200).json({
      message: "Rent paid successfully.",
      rent,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// 🔥 GET unpaid rents by month/year (all shops)
const getUnpaidRentsByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.query;

    const result = await RentService.getUnpaidRentsByMonthYear(month, year);

    if (result.total === 0) {
      return res.status(200).json({
        message: `No unpaid rents found for ${result.month}.`,
        month: result.month,
        totalUnpaid: 0,
        rents: [],
      });
    }

    return res.status(200).json({
      month: result.month,
      totalUnpaid: result.total,
      rents: result.rents,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET paid rents history (all shops)
const getPaidRentsHistory = async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await RentService.getPaidRentsHistory(limit);

    return res.status(200).json({
      totalPaid: result.total,
      rents: result.rents,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


module.exports = {
  getRentsByShop,
  payRent,
  getUnpaidRentsByMonthYear,
  getPaidRentsHistory,
};
