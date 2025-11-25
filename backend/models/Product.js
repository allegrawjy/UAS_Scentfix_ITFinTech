const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },

  detail_image: { type: String },
  page_available: { type: Boolean, default: false },
  category: { type: String },
  subcategory: { type: String },
  image_carousel: { type: [String], default: [] }
});

module.exports = mongoose.model("Product", ProductSchema);