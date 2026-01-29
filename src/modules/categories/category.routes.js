const express = require("express");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTitles,
} = require("./category.controller");
const { categoryValidator } = require("./category.validator");
const validate = require("../../middlewares/validate.middleware");
const asyncHandler = require("../../utils/asyncHandler");
const upload = require("../../middlewares/upload.middleware");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");

const router = express.Router();

// src/modules/category/category.routes.js

router.get("/", asyncHandler(getCategories));
router.get("/titles", asyncHandler(getCategoryTitles));
router.get("/:id", asyncHandler(getCategory));

// Admin Only
router.post(
  "/",
  upload.single("image"),
  categoryValidator,
  protect,
  restrictTo("admin"),
  validate,
  asyncHandler(createCategory)
);
router.put(
  "/:id",
  upload.single("image"),
  categoryValidator,
  protect,
  restrictTo("admin"),
  validate,
  asyncHandler(updateCategory)
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(deleteCategory)
);

module.exports = router;
