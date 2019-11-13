const mongoose = require('mongoose')
const Schema = mongoose.Schema

const stockDetails = new Schema(
  {
    stock: { type: Schema.Types.ObjectId, ref: 'stock' },
    itemId: { type: Schema.Types.ObjectId, ref: 'item' },
    brandId: { type: Schema.Types.ObjectId, ref: 'brand' },
    modelNumber: { type: String, require: true },
    color: { type: String, require: true },
    size: { type: String, require: true },
    initialQty: { type: Number, require: true },
    damageQty: { type: Number, require: true },
    actualQty: { type: Number, require: true },
    unitCost: { type: Number, require: true },
    totalCost: { type: Number, require: true },
    soldQty: { type: Number, default: 0 },
    date: { type: String, require: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('stockDetails', stockDetails)
