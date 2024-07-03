const { Schema, model } = require("mongoose");


const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: 3,
    },

    price: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 1,
    },

    description: {
      type: String,
      required: true,
    },

    productImage: {
      type: String,
    },

    category: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

module.exports = model("Product", productSchema);
