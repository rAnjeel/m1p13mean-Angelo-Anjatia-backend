const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    location: { type: String, trim: true },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

shopSchema.index({ merchantId: 1 });
shopSchema.index({ categoryId: 1 });

module.exports = mongoose.model("Shop", shopSchema);
