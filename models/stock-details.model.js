const mongoose = require('mongoose')
const Schema = mongoose.Schema

const stockDetails = new Schema(
  {
    stock: { type: Schema.Types.ObjectId, ref: 'stock' },
    itemId: { type: Schema.Types.ObjectId, ref: 'item' },
    brandId: { type: Schema.Types.ObjectId, ref: 'brand' },
    modelNumber: { type: String, require: [true, "Please add model number"] },
    color: { type: String, require: [true, "Please add color name"] },
    size: { type: String, require: [true, "Please add size"] },
    initialQty: { type: Number, require: [true, "Please add initial quantity"] },
    damageQty: { type: Number, require: [true, "Please add damage quantity"] },
    actualQty: { type: Number, require: [true, "Please add actual quantity"] },
    unitCost: { type: Number, require: [true, "Please add unit cost"] },
    totalCost: { type: Number, require: [true, "Please add total cost"] },
    soldQty: { type: Number, default: 0 },
    date: { type: String, require: [true, "Please add date"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('stockDetails', stockDetails)
