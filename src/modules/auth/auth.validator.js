// src/modules/auth/auth.validator.js
const { body } = require("express-validator");

const registerValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username is required").isLength({ min: 3 }).withMessage("Username must be at least 3 chars"),
  body("email")
    .isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars"),
];

const loginValidator = [
  body("login").notEmpty().withMessage("Email or username required"),
  body("password").notEmpty().withMessage("Password required"),
];

module.exports = {
  registerValidator,
  loginValidator,
};
