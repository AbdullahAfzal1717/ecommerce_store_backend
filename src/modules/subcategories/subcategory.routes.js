const express = require("express");
const {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoryTitles,
} = require("./subcategory.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");
const {
  subCategoryValidator,
  updateSubCategoryValidator,
} = require("./subcategory.validator");
const validate = require("../../middlewares/validate.middleware");
const asyncHandler = require("../../utils/asyncHandler");
const upload = require("../../middlewares/upload.middleware");

const router = express.Router();

router.get("/", asyncHandler(getSubCategories));
router.get("/titles", asyncHandler(getSubCategoryTitles));
router.get("/:id", asyncHandler(getSubCategory));
router.post(
  "/",
  upload.single("image"),
  subCategoryValidator,
  validate,
  protect,
  restrictTo("admin"),
  asyncHandler(createSubCategory)
);
router.put(
  "/:id",
  upload.single("image"),
  updateSubCategoryValidator,
  validate,
  protect,
  restrictTo("admin"),
  asyncHandler(updateSubCategory)
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(deleteSubCategory)
);

module.exports = router;
