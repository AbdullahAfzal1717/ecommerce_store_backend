// src/modules/auth/auth.routes.js
const express = require("express");
const { register, login, getMe, updateMe } = require("./auth.controller");
const {protect} = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { registerValidator, loginValidator } = require("./auth.validator");
const asyncHandler = require("../../utils/asyncHandler");
const { populate } = require("../../models/category.model");
const upload = require("../../middlewares/upload.middleware");


const router = express.Router();

router.post("/register",upload.single("avatar"), registerValidator, validate, asyncHandler(register));
router.post("/login", loginValidator, validate, asyncHandler(login));
router.get("/me", protect, getMe);
router.put("/update-profile", protect, upload.single("avatar"), asyncHandler(updateMe));

module.exports = router;
populate