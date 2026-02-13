const express = require("express");
const router = express.Router();
const spinController = require("./spin.controller");
const { validateSpinRequest } = require("./spin.validator");
const { protect } = require("../../middlewares/auth.middleware"); // Your existing auth middleware
const asyncHandler = require("../../utils/asyncHandler");

// POST /api/lucky-spin/execute
// We use POST because this action modifies the user's balance and spin count
router.post(
  "/execute",
  protect,
  validateSpinRequest,
  asyncHandler(spinController.handleSpin)
);

module.exports = router;
