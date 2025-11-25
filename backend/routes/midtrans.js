const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const Order = require('../models/Order.js');
const Cart = require('../models/Cart.js');

// Midtrans config
let core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Webhook URL: /api/midtrans/notification
router.post("/notification", async (req, res) => {
  try {
    const notification = await core.transaction.notification(req.body);
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Dapatkan order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // STATUS HANDLING
    switch (transactionStatus) {
      case "capture":
        if (fraudStatus === "challenge") order.status = "challenge";
        else if (fraudStatus === "accept") order.status = "paid";
        break;
      case "settlement":
        order.status = "paid";
        break;
      case "pending":
        order.status = "pending";
        break;
      case "deny":
        order.status = "denied";
        break;
      case "expire":
        order.status = "expired";
        break;
      case "cancel":
        order.status = "cancelled";
        break;
      default:
        order.status = transactionStatus;
    }

    await order.save();

    // Jika pembayaran sukses, kosongkan cart user
    if (order.status === "paid") {
      await Cart.findOneAndUpdate(
        { userId: order.userId },
        { $set: { items: [] } }
      );
    }

    res.json({ message: "Notification received" });

  } catch (err) {
    console.error("Midtrans webhook error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

module.exports = router;