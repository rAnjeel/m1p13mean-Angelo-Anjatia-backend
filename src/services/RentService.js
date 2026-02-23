const Rent = require("../models/Rent");
const Shop = require("../models/Shop");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const ensureShopExists = async (shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw createError(404, "Shop not found.");
  }
};

const getRentsByShop = async (shopId) => {
  return await Rent.find({ shopId }).sort({ month: -1 });
};

const payRent = async (rentId) => {
  const rent = await Rent.findById(rentId);
  if (!rent) {
    throw createError(404, "Rent not found.");
  }

  if (rent.status === "paid") {
    throw createError(400, "Rent already paid.");
  }

  rent.status = "paid";
  rent.paidAt = new Date();
  await rent.save();

  return rent;
};

module.exports = {
  getRentsByShop,
  payRent,
};