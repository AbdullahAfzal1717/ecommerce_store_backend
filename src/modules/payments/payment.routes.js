const express = require("express");
const router = express.Router();
const { createPaymentIntent } = require("./payment.controller");
const validate = require("../../middlewares/validate.middleware");
const asyncHandler = require("../../utils/asyncHandler");
const { validatePayment } = require("./payment.validator");
const { protect } = require("../../middlewares/auth.middleware");

router.post(
  "/create-intent",
  validatePayment,
  validate,
  protect,
  asyncHandler(createPaymentIntent)
);

module.exports = router;
