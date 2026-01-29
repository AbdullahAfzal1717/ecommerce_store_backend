const orderService = require("./orders.services");
const asyncHandler = require("../../utils/asyncHandler"); // Using your existing utility

const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createNewOrder(req.body);
  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});
const getMyOrders = async (req, res) => {
  try {
    // 1. Get User ID from the authentication middleware
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in request",
      });
    }

    // 2. Call the service layer
    const orders = await orderService.getOrdersByUserId(userId);

    // 3. Send success response
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    // 4. Handle errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.fetchAllOrders();
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderService.updateOrderStatus(id, status);

    return res.status(200).json({
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { placeOrder, getAllOrders, updateStatus, getMyOrders };
