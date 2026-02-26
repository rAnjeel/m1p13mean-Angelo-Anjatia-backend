const User = require("../models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary");

const SAFE_USER_PROJECTION = "-passwordHash";
const SALT_ROUNDS = 10;

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

const toSafeUser = (user) => {
  if (!user) {
    return user;
  }
  const obj = typeof user.toObject === "function" ? user.toObject() : user;
  if (!obj) {
    return obj;
  }

  // Password hash is excluded at query level, but we ensure safety here too
  delete obj.passwordHash;
  return obj;
};

const createUser = async (userData) => {
  try {
    const payload = { ...userData };
    if (payload.password) {
      payload.passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
      delete payload.password;
    }

    const user = await User.create(payload);
    const freshUser = await User.findById(user._id).select(SAFE_USER_PROJECTION);
    return toSafeUser(freshUser);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find().select(SAFE_USER_PROJECTION);
    return users.map(toSafeUser);
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
    return toSafeUser(user);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const updateUser = async (userId, updates) => {
  try {
    const payload = { ...updates };
    if (payload.password !== undefined) {
      payload.passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
      delete payload.password;
    }

    const user = await User.findByIdAndUpdate(userId, payload, {
      new: true,
      runValidators: true,
      context: "query",
    }).select(SAFE_USER_PROJECTION);

    if (!user) {
      throw createError(404, "User not found.");
    }

    return toSafeUser(user);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const deleteUser = async (userId) => {
  try {
    const user = await User.findOneAndDelete({ _id: userId }).select(SAFE_USER_PROJECTION);
    if (!user) {
      throw createError(404, "User not found.");
    }
    return toSafeUser(user);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const updateUserAvatar = async (userId, file) => {
  try {
    if (!file) {
      throw createError(400, "Avatar image file is required.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "User not found.");
    }

    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    user.avatar = {
      url: file.path,
      publicId: file.filename,
      alt: file.originalname || "",
    };

    await user.save();

    const freshUser = await User.findById(user._id).select(SAFE_USER_PROJECTION);
    return toSafeUser(freshUser);
  } catch (error) {
    throw normalizeMongoError(error);
  }
};

const removeUserAvatar = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "User not found.");
    }

    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    user.avatar = null;
    await user.save();

    const freshUser = await User.findById(user._id).select(SAFE_USER_PROJECTION);
    return toSafeUser(freshUser);
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
  updateUserAvatar,
  removeUserAvatar,
};
