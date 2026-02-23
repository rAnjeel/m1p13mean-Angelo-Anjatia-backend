const mongoose = require("mongoose");

const shopReviewSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

shopReviewSchema.index({ shopId: 1 });
shopReviewSchema.index({ clientId: 1 });

module.exports = mongoose.model("ShopReview", shopReviewSchema);