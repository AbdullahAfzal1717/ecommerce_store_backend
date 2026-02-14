const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Settings = require("../../models/setting.model");
const User = require("../../models/user.model");

const createNewOrder = async (orderData) => {
  // 1. Subtract wallet balance from user immediately if used
  if (orderData.walletAmountApplied > 0) {
    await User.findByIdAndUpdate(orderData.user, {
      $inc: { walletBalance: -orderData.walletAmountApplied },
    });
  }

  const order = await Order.create(orderData);

  // Status logic for first order (RED to YELLOW)
  const user = await User.findById(orderData.user);
  if (user && user.accountStatus === "red") {
    user.accountStatus = "yellow";
    await user.save();
  }

  // Stock logic
  for (const item of orderData.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { quantity: -item.quantity },
    });
  }
  return order;
};

const updateOrderStatus = async (orderId, status) => {
  // 1. Find order and populate user to access accountStatus and referredBy
  const order = await Order.findById(orderId).populate("user");
  if (!order) throw new Error("Order not found");

  // Prevent redundant processing if status is already the same
  if (order.orderStatus === status) return order;

  // --- LOGIC A: CANCELLATION (Inventory & Wallet Recovery) ---
  if (status === "Cancelled") {
    // Refund wallet amount if any was used
    if (order.orderStatus !== "Cancelled" && order.walletAmountApplied > 0) {
      await User.findByIdAndUpdate(order.user._id, {
        $inc: { walletBalance: order.walletAmountApplied },
      });
    }

    // Return items to stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity },
      });
    }
  }

  // --- LOGIC B: PERSIST STATUS CHANGE ---
  order.orderStatus = status;
  await order.save();

  const user = order.user;

  // --- LOGIC C: DELIVERY, MILESTONES & REFERRALS ---
  if (status === "Delivered" && user) {
    // 1. Fetch Global Config from Settings Model
    const globalConfig = await Settings.findOne({ key: "global_config" });

    // Fallbacks if admin hasn't configured settings yet
    const IS_REFERRAL_ON = globalConfig
      ? globalConfig.referralBonusEnabled
      : false;
    const BONUS_PERCENT = globalConfig
      ? globalConfig.cashbackPercentage / 100
      : 0.1;

    // 2. Account Promotion & Lucky Spin (Milestone Logic)
    // User only gets 1 spin and "Green" status if they aren't already Green.
    if (user.accountStatus !== "green") {
      user.accountStatus = "green";
      user.availableSpins += 1;
      console.log("First time Green: Reward added.");
    }
    // 2. OPTIONAL: If they are ALREADY Green, give them a spin only for big orders (e.g., > Rs. 1000)
    else if (order.totalAmount >= 1000) {
      user.availableSpins += 1;
      console.log("Loyal Green User: Bonus spin added for large order.");
    }

    await user.save();

    // 3. Referral Bonus Logic
    if (IS_REFERRAL_ON && user.referredBy) {
      const referrer = await User.findById(user.referredBy);

      if (referrer) {
        const bonusAmount = order.totalAmount * BONUS_PERCENT;

        // Update referrer's wallet
        await User.findByIdAndUpdate(referrer._id, {
          $inc: { walletBalance: bonusAmount },
        });

        // Optional: You could log this transaction in a 'WalletHistory' model here
      }
    }
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

// const updateOrderStatus = async (orderId, status) => {
//   const order = await Order.findByIdAndUpdate(
//     orderId,
//     { $set: { orderStatus: status } },
//     { new: true } // Returns the updated document
//   );

//   if (!order) throw new Error("Order not found");
//   return order;
// };

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
