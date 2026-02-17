const ShopService = require("../services/ShopService");
const { writeShopAuditLog } = require("../utils/shopAuditLogger");


const handleError = (res, error) => {
  const status = error?.status || 500;
  const payload = {
    message: error?.message || "Unexpected server error.",
  };

  if (error?.details) {
    payload.details = error.details;
  }

  return res.status(status).json(payload);
};

const validateCreateFields = ({ name, merchantId, categoryId }) => {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Shop name must be at least 2 characters long.");
  }

  if (!merchantId) {
    errors.push("merchantId is required.");
  }

  if (!categoryId) {
    errors.push("categoryId is required.");
  }

  return errors;
};


// CREATE
const createShop = async (req, res) => {
  try {
    const errors = validateCreateFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const shop = await ShopService.createShop(req.body);

    // 🔥 AUDIT LOG
    writeShopAuditLog({
      action: "ADD",
      userName: req.user?.email || "Unknown",
      userId: req.user?.sub,
      shopName: shop.name,
      shopId: shop._id,
      details: "Shop created",
    });

    return res.status(201).json({
      message: "Shop created successfully.",
      shop,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


// READ ALL
const getAllShops = async (_req, res) => {
  try {
    const shops = await ShopService.getAllShops();
    return res.status(200).json({ shops });
  } catch (error) {
    return handleError(res, error);
  }
};

// READ BY ID
const getShopById = async (req, res) => {
  try {
    const shop = await ShopService.getShopById(req.params.id);
    return res.status(200).json({ shop });
  } catch (error) {
    return handleError(res, error);
  }
};

// UPDATE
const updateShop = async (req, res) => {
  try {
    const existingShop = await ShopService.getShopById(req.params.id);

    const shop = await ShopService.updateShop(req.params.id, req.body);

    writeShopAuditLog({
      action: "UPDATE",
      userName: req.user?.email || "Unknown",
      userId: req.user?.sub,
      shopName: shop.name,
      shopId: shop._id,
      details: `Updated fields: ${Object.keys(req.body).join(", ")}`,
    });

    return res.status(200).json({
      message: "Shop updated successfully.",
      shop,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


// DELETE
const deleteShop = async (req, res) => {
  try {
    const shop = await ShopService.getShopById(req.params.id);

    await ShopService.deleteShop(req.params.id);

    writeShopAuditLog({
      action: "DELETE",
      userName: req.user?.email || "Unknown",
      userId: req.user?.sub,
      shopName: shop.name,
      shopId: shop._id,
      details: "Shop deleted",
    });

    return res.status(200).json({
      message: "Shop deleted successfully.",
      shop,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


module.exports = {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
};
