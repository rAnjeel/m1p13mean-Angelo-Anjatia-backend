const Review = require("../models/Review");
const Product = require("../models/Product");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const addReview = async (clientId, productId, rating, comment) => {
  const product = await Product.findById(productId).select("_id");
  if (!product) throw createError(404, "Product not found.");

  return await Review.create({
    clientId,
    productId,
    rating,
    comment,
  });
};

const getReviewsByProduct = async (productId) => {
  return await Review.find({ productId })
    .populate("clientId", "fullName")
    .sort({ createdAt: -1 });
};

const deleteReviewByShopkeeper = async (reviewId, shopkeeperId, userRole) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw createError(404, "Review not found.");
  }

  const normalizedRole = String(userRole || "").trim().toLowerCase();
  if (normalizedRole === "admin") {
    await Review.deleteOne({ _id: reviewId });
    return review;
  }

  const product = await Product.findById(review.productId)
    .populate("shopId", "merchantId")
    .select("shopId");

  if (!product) {
    throw createError(404, "Product not found.");
  }

  const merchantId = String(product.shopId?.merchantId || "");
  if (!merchantId || merchantId !== String(shopkeeperId)) {
    throw createError(403, "You are not allowed to delete this review.");
  }

  await Review.deleteOne({ _id: reviewId });
  return review;
};

module.exports = {
  addReview,
  getReviewsByProduct,
  deleteReviewByShopkeeper,
};
