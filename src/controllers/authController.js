const bcrypt = require("bcrypt");
const User = require("../models/User");

// Inscription d'un utilisateur
const register = async (req, res) => {
  try {
    const { role, firstName, lastName, email, password, phone } = req.body;

    // Validation basique des champs requis
    if (!role || !firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Les champs role, firstName, lastName, email et password sont obligatoires.",
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    // Hachage du mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      role,
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
    });

    // Ne pas renvoyer le hash du mot de passe
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de l'inscription.",
    });
  }
};

module.exports = {
  register,
};

