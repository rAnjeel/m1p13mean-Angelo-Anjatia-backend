const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

const userAvatarSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    alt: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    avatar: { type: userAvatarSchema, default: null },
  },
  { timestamps: true }
);

userSchema.pre("findOneAndDelete", async function userAvatarCleanup(next) {
  try {
    const user = await this.model.findOne(this.getFilter()).select("avatar.publicId");

    const publicId =
      user && user.avatar && typeof user.avatar === "object" ? user.avatar.publicId : null;

    if (!publicId) {
      next();
      return;
    }

    await cloudinary.uploader.destroy(publicId);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
