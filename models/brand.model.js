const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const brand = mongoose.Schema(
  {
    itemId: { type: String, required: true },
    brandName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('brand', brand)
