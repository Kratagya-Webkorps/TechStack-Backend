  const { Schema, model } = require("mongoose");


  const wishlistSchema = new Schema({
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
      },
    ],
  });
  module.exports = model('Wishlist', wishlistSchema);

