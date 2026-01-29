// src/middlewares/validate.middleware.js
const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // forward structured validation errors to the global error handler
    return next(
      new ApiError("Validation failed", 400, { errors: errors.array() })
    );
  }
  next();
};

module.exports = validate;
