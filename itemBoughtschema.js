const mongoose = require('mongoose');
const boughtschema = new mongoose.Schema({
    raddress: { type: String, required: true },
    from: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    transactionid:{type: String, required: true}
  });
  
  const ItemBought = mongoose.model('ItemBought', boughtschema);
  module.exports = ItemBought
  