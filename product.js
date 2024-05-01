const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  productname: { type: String, required: true },
  raddress: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;






