const { body } = require("express-validator");

const validateSettings = [
  body("cashbackPercentage")
    .isNumeric()
    .withMessage("Percentage must be a number")
    .custom((val) => val >= 0 && val <= 100)
    .withMessage("Percentage must be between 0 and 100"),
  body("winModeEnabled").isBoolean().withMessage("Win mode must be a boolean"),
  body("referralBonusEnabled").isBoolean().withMessage("Referral bonus status must be a boolean"),
];

module.exports = { validateSettings };