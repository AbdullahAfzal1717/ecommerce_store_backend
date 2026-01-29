const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true},
    description: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: { type: String,default:"" },

  },
  { timestamps: true }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
