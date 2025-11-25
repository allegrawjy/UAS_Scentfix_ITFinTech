const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const Order = require("../models/Order");
const Cart = require('../models/Cart.js');
const auth = require('../middleware/auth.js');
const midtransClient = require('midtrans-client');


// MIDTRANS CONFIG
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY
});

// CHECKOUT - CREATE ORDER
router.post('/checkout', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Ambil cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // ===== 1. Hitung subtotal =====
    let subtotal = 0;

    const orderItems = cart.items.map(item => {
      const price = item.productId.price;
      const qty = item.quantity;

      subtotal += price * qty;

      return {
        productId: item.productId._id,
        quantity: qty,
        price: price
      };
    });

    // ===== 2. Hitung tax & shipping =====
    const tax = Math.floor(subtotal * 0.10);  // 10%
    const shipping = 10000;

    // ===== 3. Hitung total akhir =====
    const totalAmount = subtotal + tax + shipping;

    // ===== 4. Simpan order ke database =====
    const newOrder = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      totalAmount,
      status: "pending"
    });

    // ===== 5. Buat transaksi Midtrans =====
    const parameter = {
      transaction_details: {
        order_id: newOrder._id.toString(),
        gross_amount: totalAmount
      },
      customer_details: {
        user_id: userId
      }
    };

    const midtransResponse = await snap.createTransaction(parameter);

    // ===== 6. Response ke frontend =====
    res.json({
      token: midtransResponse.token,
      redirect_url: midtransResponse.redirect_url
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Checkout failed" });
  }
});


module.exports = router;
