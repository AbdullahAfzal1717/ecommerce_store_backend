const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to your Auth user
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number,
        quantity: Number,
      },
    ],
    shippingDetails: {
      firstName: String,
      lastName: String,
      email: String,
      address: String,
      city: String,
      phoneNumber: String,
    },
    totalAmount: Number,
    paymentStatus: { type: String, default: "Pending" }, // 'Pending', 'Paid', 'Failed'
    stripePaymentId: String,
    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Pending"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
