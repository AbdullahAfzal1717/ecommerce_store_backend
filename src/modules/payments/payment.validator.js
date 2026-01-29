const { body } = require("express-validator");

const validatePayment = [
  body("amount").isNumeric().withMessage("Amount must be a number"),
];

module.exports = { validatePayment };
