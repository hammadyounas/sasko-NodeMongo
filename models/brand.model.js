const mongoose = require('mongoose')
const Schema = mongoose.Schema

const brand = mongoose.Schema(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'item' },
    brandName: { type: String, required: [true, "Please add brand name"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('brand', brand)
