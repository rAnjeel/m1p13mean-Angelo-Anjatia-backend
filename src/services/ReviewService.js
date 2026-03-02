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

module.exports = {
  addReview,
  getReviewsByProduct,
};
