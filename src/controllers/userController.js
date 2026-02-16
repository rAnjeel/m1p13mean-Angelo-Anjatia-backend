const UserService = require("../services/UserService");

const VALID_ROLES = ["client", "shopkeeper"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,15}$/;
const MIN_PASSWORD_LENGTH = 8;

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

const validateCreateFields = ({ role, fullName, email, password, passwordHash, phone }) => {
  const errors = [];

  if (!role) {
    errors.push("The role field is required.");
  } else if (!VALID_ROLES.includes(role.toLowerCase())) {
    errors.push(`Role must be "client" or "shopkeeper". Received: "${role}".`);
  }

  if (!fullName || fullName.trim().length === 0) {
    errors.push("The fullName field is required.");
  } else if (fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long.");
  }

  if (!email || email.trim().length === 0) {
    errors.push("The email field is required.");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Email format is invalid.");
  }

  if (!password && !passwordHash) {
    errors.push("The password field is required.");
  } else if (password && password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  } else if (!password && passwordHash && passwordHash.length < 20) {
    errors.push("passwordHash looks invalid.");
  }

  if (phone !== undefined && phone !== null && phone !== "") {
    if (!PHONE_REGEX.test(phone)) {
      errors.push("Phone number format is invalid.");
    }
  }

  return errors;
};

const validateUpdateFields = ({ role, fullName, email, password, passwordHash, phone }) => {
  const errors = [];

  if (role !== undefined) {
    if (!role) {
      errors.push("The role field cannot be empty.");
    } else if (!VALID_ROLES.includes(role.toLowerCase())) {
      errors.push(`Role must be "client" or "shopkeeper". Received: "${role}".`);
    }
  }

  if (fullName !== undefined) {
    if (!fullName || fullName.trim().length === 0) {
      errors.push("The fullName field cannot be empty.");
    } else if (fullName.trim().length < 2) {
      errors.push("Full name must be at least 2 characters long.");
    }
  }

  if (email !== undefined) {
    if (!email || email.trim().length === 0) {
      errors.push("The email field cannot be empty.");
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push("Email format is invalid.");
    }
  }

  if (password !== undefined) {
    if (!password) {
      errors.push("The password field cannot be empty.");
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
    }
  } else if (passwordHash !== undefined) {
    if (!passwordHash) {
      errors.push("The passwordHash field cannot be empty.");
    } else if (passwordHash.length < 20) {
      errors.push("passwordHash looks invalid.");
    }
  }

  if (phone !== undefined) {
    if (phone !== null && phone !== "" && !PHONE_REGEX.test(phone)) {
      errors.push("Phone number format is invalid.");
    }
  }

  return errors;
};

const createUser = async (req, res) => {
  try {
    const errors = validateCreateFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const user = await UserService.createUser(req.body);
    return res.status(201).json({
      message: "User created successfully.",
      user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAllUsers = async (_req, res) => {
  try {
    const users = await UserService.getAllUsers();
    return res.status(200).json({ users });
  } catch (error) {
    return handleError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    return res.status(200).json({ user });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validateUpdateFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const user = await UserService.updateUser(req.params.id, req.body);
    return res.status(200).json({
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await UserService.deleteUser(req.params.id);
    return res.status(200).json({
      message: "User deleted successfully.",
      user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
