const ShopService = require("../services/ShopService");
//ilaina pour le log de shop
const { writeLog } = require("../utils/shopLogger");


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
// const createShop = async (req, res) => {
//   try {
//     const errors = validateCreateFields(req.body);
//     if (errors.length > 0) {
//       return res.status(400).json({ errors });
//     }

//     const shop = await ShopService.createShop(req.body);
//     return res.status(201).json({
//       message: "Shop created successfully.",
//       shop,
//     });
//   } catch (error) {
//     return handleError(res, error);
//   }
// };
//CREATE AVEC LOG
const createShop = async (req, res) => {
  try {
    const errors = validateCreateFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const shop = await ShopService.createShop(req.body);

    const user = await User.findById(shop.merchantId);
    const userName = user ? user.fullName : "Unknown user";

    writeLog(
      `POST | User "${userName}" created shop "${shop.name}"`
    );

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
// const updateShop = async (req, res) => {
//   try {
//     const shop = await ShopService.updateShop(req.params.id, req.body);
//     return res.status(200).json({
//       message: "Shop updated successfully.",
//       shop,
//     });
//   } catch (error) {
//     return handleError(res, error);
//   }
// };
//UPDATE AVEC LOG
const updateShop = async (req, res) => {
  try {
    const oldShop = await ShopService.getShopById(req.params.id);

    const shop = await ShopService.updateShop(req.params.id, req.body);

    const user = await User.findById(shop.merchantId);
    const userName = user ? user.fullName : "Unknown user";

    writeLog(
      `PUT | User "${userName}" updated shop "${oldShop.name}" to "${shop.name}"`
    );

    return res.status(200).json({
      message: "Shop updated successfully.",
      shop,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


// DELETE
// const deleteShop = async (req, res) => {
//   try {
//     const shop = await ShopService.deleteShop(req.params.id);
//     return res.status(200).json({
//       message: "Shop deleted successfully.",
//       shop,
//     });
//   } catch (error) {
//     return handleError(res, error);
//   }
// };
//DELETE AVEC LOG
const deleteShop = async (req, res) => {
  try {
    const shop = await ShopService.getShopById(req.params.id);

    const user = await User.findById(shop.merchantId);
    const userName = user ? user.fullName : "Unknown user";

    await ShopService.deleteShop(req.params.id);

    writeLog(
      `DELETE | User "${userName}" deleted shop "${shop.name}"`
    );

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
