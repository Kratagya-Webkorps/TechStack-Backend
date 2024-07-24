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

const createPurchaseOrder = async (req, res) => {
  const { amount, currency } = req.body;
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_KEY,
  });
  const options = {
    amount: amount,
    currency: currency,
    receipt: "receipt#1",
    payment_capture: 1,
  };
  try {
    const response = await razorpay.orders.create(options);
    const { id, amount, currency } = response;
    res.json({
      order_id: id,
      currency: currency,
      amount: amount,
    });
  } catch (error) {
    console.log(error);
  }
};

const deletePurchaseOrder = async (req, res) => {
  const { username, productId } = req.body;

  try {
    const orders = await Order.find({ username });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Orders not found" });
    }

    let anyProductRemoved = false;

    for (let eachOrder of orders) {
      const initialProductCount = eachOrder.products.length;
      eachOrder.products = eachOrder.products.filter((product) => product.productId !== productId);

      if (eachOrder.products.length !== initialProductCount) {
        await eachOrder.save();
        anyProductRemoved = true;
      }
    }

    if (anyProductRemoved) {
      res.status(200).json({ message: "Product removed from Orders", orders });
    } else {
      res.status(404).json({ message: "Product not found in any order" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getAllOrdersData,
  deleteOrder,
  updateOrder,
  createPurchaseOrder,
  deletePurchaseOrder,
};
