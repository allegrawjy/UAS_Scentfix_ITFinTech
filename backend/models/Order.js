const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } // price at purchase time
    }
  ],

  // NEW FIELDS
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  shipping: { type: Number, required: true },

  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "paid", "settlement", "expired", "cancelled", "denied", "challenge"],
    default: "pending"
  },

  paymentType: { type: String, default: null },
  transactionId: { type: String, default: null },

}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
