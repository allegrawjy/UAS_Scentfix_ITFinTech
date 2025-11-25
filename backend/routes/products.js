const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products → semua product
router.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // bisa tambahkan filter nanti
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id → detail product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;