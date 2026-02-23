const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    alt: { type: String, default: "", trim: true },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: {
      type: [productImageSchema],
      default: [],
      validate: {
        validator: (images) => images.filter((image) => image.isPrimary).length <= 1,
        message: "A product can only have one primary image.",
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

productSchema.index({ shopId: 1 });

productSchema.pre("findOneAndDelete", async function productImageCleanup(next) {
  try {
    const product = await this.model.findOne(this.getFilter()).select("images.publicId");

    if (!product?.images?.length) {
      next();
      return;
    }

    await Promise.allSettled(
      product.images
        .map((image) =>
          image && typeof image === "object" ? image.publicId : null
        )
        .filter(Boolean)
        .map((publicId) => cloudinary.uploader.destroy(publicId))
    );

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Product", productSchema);
