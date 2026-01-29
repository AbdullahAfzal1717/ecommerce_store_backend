const express = require("express");
const router = express.Router();
const orderController = require("./orders.controller");
const { validateOrder, validateStatusUpdate } = require("./orders.validator");
const asyncHandler = require("../../utils/asyncHandler");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");

router.post(
  "/place-order",
  validateOrder,
  protect,
  asyncHandler(orderController.placeOrder)
);
router.get(
  "/all-orders",
  protect,
  restrictTo("admin"),
  asyncHandler(orderController.getAllOrders)
);
router.get("/my-orders", protect, asyncHandler(orderController.getMyOrders));
router.patch(
  "/:id/status",
  validateStatusUpdate,
  protect,
  restrictTo("admin"),
  asyncHandler(orderController.updateStatus)
);

module.exports = router;
