const User = require("../models/User");

const SAFE_USER_PROJECTION = "-passwordHash";

const createError = (status, message, details) => {
  const error = new Error(message);
  error.status = status;
  if (details) {
    error.details = details;
  }
  return error;
};

const normalizeMongoError = (error) => {
  if (error?.name === "ValidationError") {
    return createError(400, "Validation failed.", error.errors);
  }

  if (error?.code === 11000) {
    const fields = Object.keys(error.keyValue || {});
    const fieldLabel = fields.length > 0 ? fields.join(", ") : "unique field";
    return createError(409, `Duplicate value for ${fieldLabel}.`, error.keyValue);
  }

  if (error?.name === "CastError") {
    return createError(400, `Invalid ${error.path}.`, {
      value: error.value,
    });
  }

  return createError(500, "Unexpected server error.");
};

const createUser = async (userData) => {
  try {
    const user = await User.create(userData);
    return User.findById(user._id).select(SAFE_USER_PROJECTION);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const getAllUsers = async () => {
  try {
    return User.find().select(SAFE_USER_PROJECTION);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select(SAFE_USER_PROJECTION);
    if (!user) {
      throw createError(404, "User not found.");
    }
    return user;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const updateUser = async (userId, updates) => {
  try {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      context: "query",
    }).select(SAFE_USER_PROJECTION);

    if (!user) {
      throw createError(404, "User not found.");
    }

    return user;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId).select(SAFE_USER_PROJECTION);
    if (!user) {
      throw createError(404, "User not found.");
    }
    return user;
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
