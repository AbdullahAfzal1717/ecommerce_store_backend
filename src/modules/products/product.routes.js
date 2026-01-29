const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("./product.controller");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");
const {
  addProductValidator,
  updateProductValidator,
} = require("./product.validator");
const validate = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getProducts));
router.get("/:id", asyncHandler(getProduct));
router.post(
  "/",
  upload.array("images", 5),
  addProductValidator,
  validate,
  protect,
  restrictTo("admin"),
  asyncHandler(createProduct)
);
router.put(
  "/:id",
  upload.array("images", 5),
  updateProductValidator,
  validate,
  protect,
  restrictTo("admin"),
  asyncHandler(updateProduct)
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(deleteProduct)
);

module.exports = router;
