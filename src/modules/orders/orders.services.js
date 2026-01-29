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

module.exports = {
  createNewOrder,
  fetchAllOrders,
  updateOrderStatus,
  getOrdersByUserId,
};
