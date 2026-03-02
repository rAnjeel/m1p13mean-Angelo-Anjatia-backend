const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "limit",
        quality: "auto",
        fetch_format: "webp",
      },
    ],
  },
});

const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(
        new Error(
          "Invalid file MIME type. Only jpg, jpeg, png and webp are allowed."
        )
      );
      return;
    }

    cb(null, true);
  },
});

module.exports = avatarUpload;

