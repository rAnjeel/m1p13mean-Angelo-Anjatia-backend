const ShopReview = require("../models/ShopReview");
const Shop = require("../models/Shop");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const addReview = async (clientId, shopId, rating, comment) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw createError(404, "Shop not found.");

  return await ShopReview.create({
    clientId,
    shopId,
    rating,
    comment,
  });
};

const getReviewsByShop = async (shopId) => {
  return await ShopReview.find({ shopId })
    .populate("clientId", "fullName")
    .sort({ createdAt: -1 });
};

module.exports = {
  addReview,
  getReviewsByShop,
};