const bcrypt = require("bcrypt");
const User = require("../models/User");
const { signJwt, DEFAULT_EXPIRES_IN_SECONDS } = require("../utils/jwt");
const { getPagesByRole } = require("../config/rolePages");
const { revokeToken } = require("../utils/revokedTokenStore");

const VALID_ROLES = ["client", "shopkeeper", "admin"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,15}$/;
const MIN_PASSWORD_LENGTH = 8;

// Centralized input validation for user registration
  const validateFields = ({ role, fullName, email, password, phone }) => {
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
    const { role, fullName, email, password, phone } = req.body;

    const errors = validateFields({ role, fullName, email, password, phone });
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
      fullName: fullName.trim(),
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification champs requis
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Recherche utilisateur
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email. Please register first.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "This account is disabled.",
      });
    }

    // Comparaison mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Supprimer le hash du mot de passe de la réponse
    const { passwordHash, ...userWithoutPassword } = user.toObject();
    const token = signJwt({
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    return res.status(200).json({
      message: "Login successful.",
      token,
      tokenType: "Bearer",
      expiresIn: DEFAULT_EXPIRES_IN_SECONDS,
      pages: getPagesByRole(user.role),
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      message: "An error occurred during login.",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({
        message: "Invalid token payload.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "This account is disabled.",
      });
    }

    const { passwordHash, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({
      pages: getPagesByRole(user.role),
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error while fetching current user:", error);
    return res.status(500).json({
      message: "An error occurred while fetching current user.",
    });
  }
};

const logout = async (req, res) => {
  const token = req.token;
  const exp = req.user?.exp;

  if (!token || typeof exp !== "number") {
    return res.status(400).json({
      message: "Unable to logout with the current token.",
    });
  }

  revokeToken(token, exp);
  return res.status(200).json({
    message: "Logout successful.",
  });
};


module.exports = {
  register,
  login,
  getMe,
  logout,
};
