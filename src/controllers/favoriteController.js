const FavoriteService = require("../services/FavoriteService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
  });
};

const addFavorite = async (req, res) => {
  try {
    const favorite = await FavoriteService.addFavorite(
      req.user.sub,
      req.params.shopId
    );

    return res.status(201).json({
      message: "Shop added to favorites.",
      favorite,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const removeFavorite = async (req, res) => {
  try {
    await FavoriteService.removeFavorite(
      req.user.sub,
      req.params.shopId
    );

    return res.status(200).json({
      message: "Shop removed from favorites.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getFavorites = async (req, res) => {
  try {
    const favorites = await FavoriteService.getFavorites(req.user.sub);
    return res.status(200).json({ favorites });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};