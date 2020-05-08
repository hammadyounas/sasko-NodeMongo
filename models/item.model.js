const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Items = mongoose.Schema({
  name: { type: String, required: [true, "Please add item name"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: true, updatedAt: true }
})


module.exports = mongoose.model('item', Items)
