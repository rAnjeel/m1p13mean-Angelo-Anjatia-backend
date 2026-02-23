const Product = require("../models/Product");
const Shop = require("../models/Shop");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");

const createError = (status, message, details) => {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
};

const normalizeMongoError = (error) => {
  if (error?.status) {
    return error;
  }

  if (error?.name === "ValidationError") {
    return createError(400, "Validation failed.", error.errors);
  }

  if (error?.code === 11000) {
    return createError(409, "Duplicate value.", error.keyValue);
  }

  if (error?.name === "CastError") {
    return createError(400, `Invalid ${error.path}.`, { value: error.value });
  }

  return createError(500, "Unexpected server error.");
};

const MAX_IMAGES_PER_PRODUCT = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const CLOUDINARY_UPLOAD_OPTIONS = {
  folder: "ecommerce/products",
  transformation: [
    {
      width: 1000,
      height: 1000,
      crop: "limit",
      quality: "auto",
      fetch_format: "webp",
    },
  ],
};

const parseDataUri = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1].toLowerCase(),
    base64: match[2],
  };
};

const validateDataUriImage = (dataUri) => {
  const parsed = parseDataUri(dataUri);
  if (!parsed) {
    throw createError(400, "Invalid image format. Expected base64 data URI.");
  }

  if (!ALLOWED_MIME_TYPES.has(parsed.mimeType)) {
    throw createError(415, "Invalid image type. Only jpg, jpeg, png and webp are allowed.");
  }

  const sizeInBytes = Buffer.byteLength(parsed.base64, "base64");
  if (sizeInBytes > MAX_IMAGE_BYTES) {
    throw createError(400, "Image must be smaller than 5MB.");
  }
};

const extractLegacyDataUriImages = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter((item) => typeof item === "string" && item.startsWith("data:image/"));
};

const uploadDataUriImages = async (dataUris = []) => {
  const uploaded = [];

  for (const dataUri of dataUris) {
    validateDataUriImage(dataUri);
    const result = await cloudinary.uploader.upload(dataUri, CLOUDINARY_UPLOAD_OPTIONS);
    uploaded.push({
      url: result.secure_url,
      publicId: result.public_id,
      alt: "",
      isPrimary: false,
      order: 0,
    });
  }

  return uploaded;
};

const sanitizeProductPayload = (payload = {}) => {
  const sanitized = { ...payload };

  // Product images are managed only via dedicated upload endpoints.
  // Ignore legacy JSON images payloads coming from frontend forms.
  if (Object.prototype.hasOwnProperty.call(sanitized, "images")) {
    delete sanitized.images;
  }

  return sanitized;
};

const normalizeImages = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  const sortedImages = [...images].sort((left, right) => left.order - right.order);
  const primaryIndex = sortedImages.findIndex((image) => image.isPrimary);

  return sortedImages.map((image, index) => ({
    url: image.url,
    publicId: image.publicId,
    alt: image.alt || "",
    isPrimary: primaryIndex === -1 ? index === 0 : index === primaryIndex,
    order: index,
  }));
};

const ensureShopExists = async (shopId) => {
  if (!shopId) return;
  const shop = await Shop.findById(shopId).select("_id");
  if (!shop) {
    throw createError(404, "Shop not found.");
  }
};

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) return;
  const category = await Category.findById(categoryId).select("_id");
  if (!category) {
    throw createError(404, "Category not found.");
  }
};

// CREATE
const createProduct = async (productData) => {
  try {
    const legacyDataUriImages = extractLegacyDataUriImages(productData?.images);
    const payload = sanitizeProductPayload(productData);
    await ensureShopExists(payload.shopId);
    await ensureCategoryExists(payload.categoryId);
    const product = await Product.create(payload);

    if (legacyDataUriImages.length > 0) {
      if (legacyDataUriImages.length > MAX_IMAGES_PER_PRODUCT) {
        throw createError(400, `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images.`);
      }

      const uploadedImages = await uploadDataUriImages(legacyDataUriImages);
      product.images = normalizeImages(
        uploadedImages.map((image, index) => ({
          ...image,
          isPrimary: index === 0,
          order: index,
        }))
      );
      await product.save();
    }

    return product;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ ALL
const getAllProducts = async () => {
  try {
    return await Product.find().populate("shopId", "name merchantId categoryId");
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ BY ID
const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId).populate(
      "shopId",
      "name merchantId categoryId"
    );

    if (!product) {
      throw createError(404, "Product not found.");
    }

    return product;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// UPDATE
const updateProduct = async (productId, updates) => {
  try {
    const legacyDataUriImages = extractLegacyDataUriImages(updates?.images);
    const payload = sanitizeProductPayload(updates);

    if (payload?.shopId) {
      await ensureShopExists(payload.shopId);
    }
    if (payload?.categoryId) {
      await ensureCategoryExists(payload.categoryId);
    }

    const product = await Product.findByIdAndUpdate(productId, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!product) {
      throw createError(404, "Product not found.");
    }

    if (legacyDataUriImages.length > 0) {
      if (product.images.length + legacyDataUriImages.length > MAX_IMAGES_PER_PRODUCT) {
        throw createError(400, `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images.`);
      }

      const uploadedImages = await uploadDataUriImages(legacyDataUriImages);
      const hasPrimary = product.images.some((image) => image.isPrimary);
      const nextImages = [
        ...product.images.map((image) => ({
          url: image.url,
          publicId: image.publicId,
          alt: image.alt || "",
          isPrimary: image.isPrimary,
          order: image.order,
        })),
        ...uploadedImages.map((image, index) => ({
          ...image,
          isPrimary: !hasPrimary && index === 0,
          order: product.images.length + index,
        })),
      ];

      product.images = normalizeImages(nextImages);
      await product.save();
    }

    return product;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// DELETE
const deleteProduct = async (productId) => {
  try {
    const product = await Product.findOneAndDelete({ _id: productId });
    if (!product) {
      throw createError(404, "Product not found.");
    }
    return product;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const addProductImages = async (productId, files = [], replaceImages = false) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw createError(404, "Product not found.");
    }

    if (!Array.isArray(files) || files.length === 0) {
      throw createError(400, "At least one image file is required.");
    }

    if (replaceImages && product.images.length > 0) {
      await Promise.allSettled(
        product.images
          .map((image) => image.publicId)
          .filter(Boolean)
          .map((publicId) => cloudinary.uploader.destroy(publicId))
      );

      product.images = [];
      await product.save();
    }

    if (product.images.length + files.length > MAX_IMAGES_PER_PRODUCT) {
      throw createError(400, `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images.`);
    }

    const hasPrimary = product.images.some((image) => image.isPrimary);

    const uploadedImages = files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      alt: file.originalname || "",
      isPrimary: !hasPrimary && index === 0,
      order: product.images.length + index,
    }));

    const nextImages = [
      ...product.images.map((image) => ({
        url: image.url,
        publicId: image.publicId,
        alt: image.alt || "",
        isPrimary: image.isPrimary,
        order: image.order,
      })),
      ...uploadedImages,
    ];

    product.images = normalizeImages(nextImages);
    await product.save();

    return product;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const removeProductImage = async (productId, publicId) => {
  try {
    const decodedPublicId = decodeURIComponent(publicId);
    const product = await Product.findById(productId).select("images");

    if (!product) {
      throw createError(404, "Product not found.");
    }

    const imageToRemove = product.images.find(
      (image) => image.publicId === decodedPublicId
    );

    if (!imageToRemove) {
      throw createError(404, "Image not found for this product.");
    }

    await cloudinary.uploader.destroy(decodedPublicId);

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      { $pull: { images: { publicId: decodedPublicId } } },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedProduct) {
      throw createError(404, "Product not found.");
    }

    const normalizedImages = normalizeImages(updatedProduct.images);
    updatedProduct.images = normalizedImages;
    await updatedProduct.save();

    return updatedProduct;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductImages,
  removeProductImage,
};
