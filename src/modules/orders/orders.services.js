const Order = require("../../models/order.model");
const Product = require("../../models/product.model"); // Adjust path based on your structure

const createNewOrder = async (orderData) => {
  // 1. Create the Order in MongoDB
  const order = await Order.create(orderData);

  // 2. Loop through items and decrease stock (Professional Touch)
  for (const item of orderData.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { quantity: -item.quantity }, // Subtract bought quantity from stock
    });
  }

  return order;
};

const getOrdersByUserId = async (userId) => {
  try {
    // We sort by createdAt: -1 so the user sees their newest orders first
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return orders;
  } catch (error) {
    throw new Error("Error fetching user orders: " + error.message);
  }
};

const fetchAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 });
};

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { $set: { orderStatus: status } },
    { new: true } // Returns the updated document
  );

  if (!order) throw new Error("Order not found");
  return order;
};

const getDashboardAnalytics = async () => {
  // 1. Fetch all non-cancelled orders for calculations
  const allOrders = await Order.find({ orderStatus: { $ne: "Cancelled" } });

  // 2. Calculate Summary Stats
  const totalRevenue = allOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );
  const totalOrders = allOrders.length;
  const pending = allOrders.filter((o) =>
    ["Pending", "Processing"].includes(o.orderStatus)
  ).length;
  const delivered = allOrders.filter(
    (o) => o.orderStatus === "Delivered"
  ).length;

  // 3. Get Monthly Chart Data using Aggregation
  const chartStats = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Map month numbers (1-12) to Names (Jan-Dec)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedChart = chartStats.map((item) => ({
    hKey: monthNames[item._id - 1], // for the big Sales Chart
    month: monthNames[item._id - 1], // for the small Orders Chart
    revenue: item.revenue,
    orders: item.orders,
  }));
  const reportStats = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        // Count delivered orders as 'Completed'
        completed: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] },
        },
        // Count Pending/Processing as 'Pending'
        pending: {
          $sum: {
            $cond: [{ $in: ["$orderStatus", ["Pending", "Processing"]] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const reportData = reportStats.map((item) => ({
    label: monthNames[item._id - 1],
    A: item.pending, // Matches dataKey="A" in the chart
    B: item.completed, // Matches dataKey="B" in the chart
  }));

  return {
    summary: {
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      pendingOrders: pending,
      deliveredOrders: delivered,
    },
    chartData: formattedChart,
    reportData: reportData,
  };
};

// backend/services/order.service.js
const getUserDashboardData = async (userId) => {
  // 1. Fetch Summary Stats (Basic Info)
  const orders = await Order.find({ user: userId });

  const totalSpent = orders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeOrders = orders.filter(
    (o) => !["Delivered", "Cancelled"].includes(o.orderStatus)
  ).length;

  // 2. NEW: Calculate Spending Trend (For the Chart)
  // We group orders by month and sum the totalAmount
  const spendingStats = await Order.aggregate([
    {
      $match: {
        user: userId,
        orderStatus: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" }, // Extract month (1-12)
        amount: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } }, // Sort by month order
  ]);

  // Convert month numbers (1, 2, 3) to names (Jan, Feb, Mar)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const spendingData = spendingStats.map((item) => ({
    month: monthNames[item._id - 1],
    amount: item.amount,
  }));

  // 3. Get recent activity (last 5 orders)
  const recentOrders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Return everything in one object
  return {
    summary: {
      totalOrders: orders.length,
      activeOrders,
      totalSpent: totalSpent.toFixed(2),
    },
    spendingData, // The frontend chart will now find this!
    recentOrders,
  };
};
const getReferralHistory = async (userId) => {
  // We use the "index: true" we added to find users efficiently
  const referrals = await User.find({ referredBy: userId })
    .select("username email accountStatus createdAt") // Only grab what we need
    .sort({ createdAt: -1 });

  return referrals;
};

module.exports = {
  createNewOrder,
  fetchAllOrders,
  updateOrderStatus,
  getOrdersByUserId,
  getDashboardAnalytics,
  getUserDashboardData,
  getReferralHistory,
};
