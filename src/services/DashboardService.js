const Shop = require("../models/Shop");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Total number of shops
const getTotalShops = async () => {
  try {
    return await Shop.countDocuments();
  } catch (error) {
    throw createError(500, "Failed to count shops.");
  }
};

// Number of shops grouped by category
const getShopsByCategory = async () => {
  try {
    return await Shop.aggregate([
      {
        $group: {
          _id: "$categoryId",
          totalShops: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          categoryName: "$category.name",
          totalShops: 1,
        },
      },
    ]);
  } catch (error) {
    throw createError(500, "Failed to group shops by category.");
  }
};

module.exports = {
  getTotalShops,
  getShopsByCategory,
};
