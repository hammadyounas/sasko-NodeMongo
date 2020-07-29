const mongoose = require('mongoose')
const Schema = mongoose.Schema

const invoiceDetails = new Schema(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'invoice' },
    stockDetailId: { type: Schema.Types.ObjectId, ref: 'stockDetails' },
    itemId: { type: Schema.Types.ObjectId, ref: 'item' },
    brandId: { type: Schema.Types.ObjectId, ref: 'brand' },
    modelNumber: { type: String, required: [true, "Please add model number"] },
    color: { type: String, required: [true, "Please add color name"] },
    avgCost: { type: Number, required: [true, "Please add average cost"] },
    rate: { type: Number, required: [true, "Please add price"] },
    pieceQty: { type: Number, required: [true, "Please add piece quantity"] },
    discount: { type: Number, required: [true, "Please add discount value"] },
    returnQty: { type: Number, default: 0 },
    afterDiscount: { type: Number, required: [true, "after discount value not found"] },
    totalCost: { type: Number, required: [true, "total cost value not found"] },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('invoiceDetails', invoiceDetails)
