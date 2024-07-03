const { Schema, model } = require("mongoose");

// Define the Cart schema
const cartSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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
});

// Create the Cart model
module.exports = model('Cart', cartSchema);
