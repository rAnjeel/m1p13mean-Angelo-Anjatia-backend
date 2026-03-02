const Shop = require("../models/Shop");
const User = require("../models/User");
const Order = require("../models/Order");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const formatDayKeyUTC = (date) => date.toISOString().slice(0, 10);
const formatMonthKeyUTC = (date) => date.toISOString().slice(0, 7);

const getUserCreatedAtRange = async () => {
  const [range] = await User.aggregate([
    {
      $group: {
        _id: null,
        minDate: { $min: "$createdAt" },
        maxDate: { $max: "$createdAt" },
      },
    },
  ]);

  if (!range || !range.minDate || !range.maxDate) {
    return { minDate: null, maxDate: null };
  }

  return { minDate: range.minDate, maxDate: range.maxDate };
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
        $match: {
          "category.type": "shop",
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          categoryName: "$category.name",
          categoryType: "$category.type",
          totalShops: 1,
        },
      },
    ]);
  } catch (error) {
    throw createError(500, "Failed to group shops by category.");
  }
};

// Total revenue from paid orders
const getTotalRevenue = async () => {
  try {
    const [row] = await Order.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    return Number(row?.totalRevenue || 0);
  } catch (error) {
    throw createError(500, "Failed to calculate total revenue.");
  }
};

// Total number of users
const getTotalUser = async () => {
  try {
    return await User.countDocuments();
  } catch (error) {
    throw createError(500, "Failed to count users.");
  }
};

// Total number of users created by day (last N days)
const getLastDaysStats = async (limit = 5) => {
  try {
    const safeLimit = toPositiveInt(limit, 5);
    const { minDate, maxDate } = await getUserCreatedAtRange();

    if (!minDate || !maxDate) return [];

    const endDayUTC = new Date(
      Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth(), maxDate.getUTCDate())
    );
    let startDayUTC = new Date(endDayUTC);
    startDayUTC.setUTCDate(endDayUTC.getUTCDate() - (safeLimit - 1));

    const minDayUTC = new Date(
      Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), minDate.getUTCDate())
    );
    if (startDayUTC < minDayUTC) startDayUTC = minDayUTC;

    const endNextDayUTC = new Date(endDayUTC);
    endNextDayUTC.setUTCDate(endDayUTC.getUTCDate() + 1);

    const raw = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDayUTC, $lt: endNextDayUTC },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const countByDay = new Map(raw.map((row) => [row._id, row.totalUsers]));
    const results = [];
    for (
      let d = new Date(startDayUTC);
      d < endNextDayUTC;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const key = formatDayKeyUTC(d);
      results.push({ date: key, totalUsers: countByDay.get(key) || 0 });
    }

    return results;
  } catch (error) {
    throw createError(500, "Failed to get last days stats");
  }
};

// Total number of users created by month (last N months)
const getLastMonthsStats = async (limit = 5) => {
  try {
    const safeLimit = toPositiveInt(limit, 5);
    const { minDate, maxDate } = await getUserCreatedAtRange();

    if (!minDate || !maxDate) return [];

    const endMonthUTC = new Date(
      Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth(), 1)
    );
    let startMonthUTC = new Date(endMonthUTC);
    startMonthUTC.setUTCMonth(endMonthUTC.getUTCMonth() - (safeLimit - 1));

    const minMonthUTC = new Date(
      Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1)
    );
    if (startMonthUTC < minMonthUTC) startMonthUTC = minMonthUTC;

    const endNextMonthUTC = new Date(endMonthUTC);
    endNextMonthUTC.setUTCMonth(endMonthUTC.getUTCMonth() + 1);

    const raw = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startMonthUTC, $lt: endNextMonthUTC },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          totalUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const countByMonth = new Map(raw.map((row) => [row._id, row.totalUsers]));
    const results = [];
    for (
      let d = new Date(startMonthUTC);
      d < endNextMonthUTC;
      d.setUTCMonth(d.getUTCMonth() + 1)
    ) {
      const key = formatMonthKeyUTC(d);
      results.push({ month: key, totalUsers: countByMonth.get(key) || 0 });
    }

    return results;
  } catch (error) {
    throw createError(500, "Failed to get last months stats");
  }
};

module.exports = {
  getTotalShops,
  getShopsByCategory,
  getTotalUser,
  getTotalRevenue,
  getLastDaysStats,
  getLastMonthsStats,
};
