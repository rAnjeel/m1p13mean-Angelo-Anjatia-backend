const ShopReviewService = require("../services/ShopReviewService");

const handleError = (res, error) => {
  return res.status(error.status || 500).json({
    message: error.message || "Unexpected server error.",
  });
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    const review = await ShopReviewService.addReview(
      req.user.sub,
      req.params.shopId,
      rating,
      comment
    );

    return res.status(201).json({
      message: "Review added successfully.",
      review,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getReviewsByShop = async (req, res) => {
  try {
    const reviews = await ShopReviewService.getReviewsByShop(
      req.params.shopId
    );

    return res.status(200).json({ reviews });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  addReview,
  getReviewsByShop,
};