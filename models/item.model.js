const mongoose = require('mongoose')

const Items = mongoose.Schema({
  
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: true, updatedAt: true }
})


module.exports = mongoose.model('item', Items)
