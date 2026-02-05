const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["shop", "product"],
      index: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ type: 1 });

module.exports = mongoose.model("Category", categorySchema);
