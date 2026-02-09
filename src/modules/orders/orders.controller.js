const orderService = require("./orders.services");
const User = require("../../models/user.model");

const placeOrder = async (req, res) => {
  try {
    const { walletAmountApplied, totalAmount } = req.body;

    // Safety check: Does the user actually have this balance?
    const user = await User.findById(req.user._id);
    if (walletAmountApplied > user.walletBalance) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const orderData = {
      ...req.body,
      user: req.user._id,
      finalAmountPaid: totalAmount - walletAmountApplied,
    };

    const order = await orderService.createNewOrder(orderData);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(orderId, status);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUserId(req.user._id);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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

const getAdminDashboardData = async (req, res) => {
  try {
    const data = await orderService.getDashboardAnalytics();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Analytics Error", error: error.message });
  }
};
const getUserDashboardData = async (req, res) => {
  const userId = req.user?._id;

  try {
    const data = await orderService.getUserDashboardData(userId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Analytics Error", error: error.message });
  }
};
const getReferrals = async (req, res) => {
  const userId = req.user?._id;

  try {
    const data = await orderService.getReferralHistory(userId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Analytics Error", error: error.message });
  }
};
module.exports = {
  placeOrder,
  getAllOrders,
  updateStatus,
  getMyOrders,
  getAdminDashboardData,
  getUserDashboardData,
  getReferrals,
  changeStatus,
};
