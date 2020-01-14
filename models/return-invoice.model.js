const mongoose = require('mongoose')
const Schema = mongoose.Schema

const returnInvoice = new Schema(
  {
    date: { type: Date, required: true },
    invoiceDetailId: { type: Schema.Types.ObjectId, ref: 'invoiceDetails' },
    returnInvoiceNo: { type: String },
    returnQty: { type: Number, required: true },
    damageQty: { type: Number, required: true },
    totalReturnQty: { type: Number, default: false },
    returnAmmount:{type:Number, require: true },
    rate:{type:Number, require: true },
    discount: { type: Number, required: true },
    status: { type: Boolean, default: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'item' },
    brandId: { type: Schema.Types.ObjectId, ref: 'brand' },
    customerId: { type: Schema.Types.ObjectId, ref: 'customer' },
    modelNumber: { type: String, require: true },
    color: { type: String, require: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('returnInvoice', returnInvoice)
