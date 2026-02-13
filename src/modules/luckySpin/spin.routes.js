const express = require("express");
const router = express.Router();
const spinController = require("./spin.controller");
const { validateSpinRequest } = require("./spin.validator");
const { verifyToken } = require("../../middleware/auth.middleware"); // Your existing auth middleware

// POST /api/lucky-spin/execute
// We use POST because this action modifies the user's balance and spin count
router.post(
  "/execute",
  verifyToken,
  validateSpinRequest,
  spinController.handleSpin
);

module.exports = router;
