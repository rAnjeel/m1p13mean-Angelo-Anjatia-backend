const Favorite = require("../models/Favorite");
const Shop = require("../models/Shop");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const addFavorite = async (clientId, shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw createError(404, "Shop not found.");

  return await Favorite.create({ clientId, shopId });
};

const removeFavorite = async (clientId, shopId) => {
  const favorite = await Favorite.findOneAndDelete({ clientId, shopId });
  if (!favorite) throw createError(404, "Favorite not found.");
  return favorite;
};

const getFavorites = async (clientId) => {
  return await Favorite.find({ clientId })
    .populate("shopId", "name description location");
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};