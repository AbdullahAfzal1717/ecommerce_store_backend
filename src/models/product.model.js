const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        images: [{ type: String }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
