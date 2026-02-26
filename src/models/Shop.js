const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

const shopImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    alt: { type: String, default: "", trim: true },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

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
    images: {
      type: [shopImageSchema],
      default: [],
      validate: {
        validator: (images) => images.filter((image) => image.isPrimary).length <= 1,
        message: "A shop can only have one primary image.",
      },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

shopSchema.index({ merchantId: 1 });
shopSchema.index({ categoryId: 1 });

shopSchema.pre("findOneAndDelete", async function shopImageCleanup(next) {
  try {
    const shop = await this.model.findOne(this.getFilter()).select("images.publicId");

    if (!shop?.images?.length) {
      next();
      return;
    }

    await Promise.allSettled(
      shop.images
        .map((image) => (image && typeof image === "object" ? image.publicId : null))
        .filter(Boolean)
        .map((publicId) => cloudinary.uploader.destroy(publicId))
    );

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Shop", shopSchema);
