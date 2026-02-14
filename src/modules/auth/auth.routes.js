// src/modules/auth/auth.routes.js
const express = require("express");
const {
  register,
  login,
  getMe,
  updateMe,
  getTree,
} = require("./auth.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  registerValidator,
  loginValidator,
  treeValidator,
} = require("./auth.validator");
const asyncHandler = require("../../utils/asyncHandler");
const { populate } = require("../../models/category.model");
const upload = require("../../middlewares/upload.middleware");

const router = express.Router();

router.post(
  "/register",
  upload.single("avatar"),
  registerValidator,
  validate,
  asyncHandler(register)
);
router.post("/login", loginValidator, validate, asyncHandler(login));
router.get("/me", protect, getMe);
router.put(
  "/update-profile",
  protect,
  upload.single("avatar"),
  asyncHandler(updateMe)
);
router.get("/referral-tree", protect, treeValidator, asyncHandler(getTree));
router.get(
  "/tree/:userId",
  protect,
  restrictTo("admin"),
  treeValidator,
  asyncHandler(getTree)
);

module.exports = router;
populate;
