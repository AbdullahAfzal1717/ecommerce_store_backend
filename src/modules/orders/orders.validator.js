const { body } = require("express-validator");

const validateOrder = [
  // Validate Items Array
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must have at least one item"),
  body("items.*.productId").isMongoId().withMessage("Invalid Product ID"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  // Validate Shipping Details (Nested Object)
  body("shippingDetails.firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),
  body("shippingDetails.address")
    .notEmpty()
    .withMessage("Shipping address is required"),
  body("shippingDetails.phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required"),

  // Validate Payment Details
  body("totalAmount").isNumeric().withMessage("Total amount must be a number"),
  body("stripePaymentId")
    .notEmpty()
    .withMessage("Stripe Payment ID is required"),

  // FIXED: The correct way to do "valid choices" in express-validator
  body("orderStatus")
    .optional()
    .isIn(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"])
    .withMessage("Invalid order status"),
];

// Separate validation for the Admin Status Update Route
const validateStatusUpdate = [
  body("orderStatus")
    .exists()
    .withMessage("Order status is required")
    .isIn(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"])
    .withMessage("Invalid order status choice"),
];

module.exports = { validateOrder, validateStatusUpdate };
