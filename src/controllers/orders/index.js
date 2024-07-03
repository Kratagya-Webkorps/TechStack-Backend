const Order = require("../../models/order.models");

const createOrder = async (req, res) => {
  try {
    const { products, amount, status, method, username } = req.body;
    const order = new Order({
      username,
      products,
      amount,
      status,
      method,
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = createOrder;

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllOrdersData = async (req, res) => {
  try {
    const { username } = req.body;

    const orders = await Order.find({ username });

    if (!orders) {
      return res.status(404).json({ error: "Orders not found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getAllOrdersData,
  deleteOrder,
  updateOrder,
};
