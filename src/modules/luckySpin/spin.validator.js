const { header } = require("express-validator");

const validateSpinRequest = [
  // Ensure the user is logged in via token
  header("authorization")
    .notEmpty()
    .withMessage("Authorization token is required to spin"),
];

module.exports = { validateSpinRequest };