const Rent = require("../models/Rent");
const Shop = require("../models/Shop");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const formatMonth = (date) => {
  return date.toISOString().slice(0, 7);
};

const generateMissingMonths = async (shop) => {
  const startDate = new Date(shop.createdAt);
  const today = new Date();

  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const existingRents = await Rent.find({ shopId: shop._id });
  const existingMonths = new Set(existingRents.map(r => r.month));

  let cursor = new Date(startMonth);

  while (cursor <= currentMonth) {
    const monthKey = formatMonth(cursor);

    if (!existingMonths.has(monthKey)) {
      await Rent.create({
        shopId: shop._id,
        month: monthKey,
        amount: 500000,
        status: "unpaid",
      });
    }

    cursor.setMonth(cursor.getMonth() + 1);
  }
};

const getRentsByShop = async (shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw createError(404, "Shop not found.");
  }

  // 🔥 Génère les mois manquants
  await generateMissingMonths(shop);

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