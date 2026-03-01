const Shop = require("../models/Shop");
const Category = require("../models/Category");
const User = require("../models/User");
const Rent = require("../models/Rent"); // 🔥 AJOUT
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

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) return;
  const category = await Category.findById(categoryId).select("_id");
  if (!category) {
    throw createError(404, "Category not found.");
  }
};

const ensureMerchantExists = async (merchantId) => {
  if (!merchantId) return;
  const user = await User.findById(merchantId).select("_id");
  if (!user) {
    throw createError(404, "Merchant not found.");
  }
};

// CREATE
const createShop = async (shopData) => {
  try {
    await ensureMerchantExists(shopData.merchantId);
    await ensureCategoryExists(shopData.categoryId);

    const shop = await Shop.create(shopData);

    // 🔥 Création automatique du premier loyer
    const firstMonth = shop.createdAt.toISOString().slice(0, 7);

    await Rent.create({
      shopId: shop._id,
      month: firstMonth,
      amount: 500000, // montant fixe pour l’instant
    });

    return shop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// READ ALL
const getAllShops = async () => {
  try {
    return await Shop.find()
      .populate("merchantId", "fullName email")
      .populate("categoryId", "name type");
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

//READ BY ID
const getShopById = async (shopId) => {
  try {
    const shop = await Shop.findById(shopId)
      .populate("merchantId", "fullName email")
      .populate("categoryId", "name type");

    if (!shop) {
      throw createError(404, "Shop not found.");
    }
    return shop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// UPDATE
const updateShop = async (shopId, updates) => {
  try {
    if (updates?.merchantId) {
      await ensureMerchantExists(updates.merchantId);
    }
    if (updates?.categoryId) {
      await ensureCategoryExists(updates.categoryId);
    }

    const shop = await Shop.findByIdAndUpdate(shopId, updates, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!shop) {
      throw createError(404, "Shop not found.");
    }

    return shop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

// DELETE
const deleteShop = async (shopId) => {
  try {
    const shop = await Shop.findOneAndDelete({ _id: shopId });
    if (!shop) {
      throw createError(404, "Shop not found.");
    }
    return shop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const addShopImages = async (shopId, files = [], replaceImages = false) => {
  try {
    const shop = await Shop.findById(shopId);

    if (!shop) {
      throw createError(404, "Shop not found.");
    }

    if (!Array.isArray(files) || files.length === 0) {
      throw createError(400, "At least one image file is required.");
    }

    if (replaceImages && shop.images.length > 0) {
      await Promise.allSettled(
        shop.images
          .map((image) => image.publicId)
          .filter(Boolean)
          .map((publicId) => cloudinary.uploader.destroy(publicId))
      );

      shop.images = [];
      await shop.save();
    }

    const uploadedImages = files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      alt: file.originalname || "",
      isPrimary: shop.images.length === 0 && index === 0,
      order: shop.images.length + index,
    }));

    const nextImages = [
      ...shop.images.map((image) => ({
        url: image.url,
        publicId: image.publicId,
        alt: image.alt || "",
        isPrimary: image.isPrimary,
        order: image.order,
      })),
      ...uploadedImages,
    ];

    shop.images = normalizeImages(nextImages);
    await shop.save();

    return shop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const removeShopImage = async (shopId, publicId) => {
  try {
    const decodedPublicId = decodeURIComponent(publicId);
    const shop = await Shop.findById(shopId).select("images");

    if (!shop) {
      throw createError(404, "Shop not found.");
    }

    const imageToRemove = shop.images.find(
      (image) => image.publicId === decodedPublicId
    );

    if (!imageToRemove) {
      throw createError(404, "Image not found for this shop.");
    }

    await cloudinary.uploader.destroy(decodedPublicId);

    const updatedShop = await Shop.findOneAndUpdate(
      { _id: shopId },
      { $pull: { images: { publicId: decodedPublicId } } },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedShop) {
      throw createError(404, "Shop not found.");
    }

    const normalizedImages = normalizeImages(updatedShop.images);
    updatedShop.images = normalizedImages;
    await updatedShop.save();

    return updatedShop;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

module.exports = {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
  addShopImages,
  removeShopImage,
};
