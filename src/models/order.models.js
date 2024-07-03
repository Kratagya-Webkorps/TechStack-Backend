const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Order", orderSchema);
