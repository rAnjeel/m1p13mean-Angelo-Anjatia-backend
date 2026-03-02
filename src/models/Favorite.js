const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Un client ne peut pas mettre 2 fois le même shop en favori
favoriteSchema.index({ clientId: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);