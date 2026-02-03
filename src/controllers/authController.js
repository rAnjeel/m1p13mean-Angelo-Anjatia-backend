const bcrypt = require("bcrypt");
const User = require("../models/User");

const VALID_ROLES = ["client", "shopkeeper"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,15}$/;
const MIN_PASSWORD_LENGTH = 8;

// Centralized input validation for user registration
const validateFields = ({ role, firstName, lastName, email, password, phone }) => {
  const errors = [];

  if (!role) {
    errors.push("The role field is required.");
  } else if (!VALID_ROLES.includes(role.toLowerCase())) {
    errors.push(`Role must be "client" or "shopkeeper". Received: "${role}".`);
  }

  if (!firstName || firstName.trim().length === 0) {
    errors.push("The firstName field is required.");
  } else if (firstName.trim().length < 2) {
    errors.push("First name must be at least 2 characters long.");
  }

  if (!lastName || lastName.trim().length === 0) {
    errors.push("The lastName field is required.");
  } else if (lastName.trim().length < 2) {
    errors.push("Last name must be at least 2 characters long.");
  }

  if (!email || email.trim().length === 0) {
    errors.push("The email field is required.");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Email format is invalid.");
  }

  if (!password) {
    errors.push("The password field is required.");
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }

  if (phone !== undefined && phone !== null && phone !== "") {
    if (!PHONE_REGEX.test(phone)) {
      errors.push("Phone number format is invalid.");
    }
  }

  return errors;
};

const register = async (req, res) => {
  try {
    const { role, firstName, lastName, email, password, phone } = req.body;

    const errors = validateFields({ role, firstName, lastName, email, password, phone });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      role: normalizedRole,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone ? phone.trim() : undefined,
    });

    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      message: "User created successfully.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({
      message: "An error occurred during registration.",
    });
  }
};

module.exports = {
  register,
};