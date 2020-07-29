const mongoose = require('mongoose')
const Schema = mongoose.Schema

const returnInvoice = new Schema(
  {
    date: { type: Date, required: [true, "Please add return invoice date"] },
    invoiceDetailId: { type: Schema.Types.ObjectId, ref: 'invoiceDetails' },
    returnInvoiceNo: { type: String },
    returnQty: { type: Number, required: [true, "Please add return quantity"] },
    damageQty: { type: Number, required: [true, "Please add damage quantity"] },
    totalReturnQty: { type: Number, default: false },
    returnAmmount:{type:Number, require: [true, "Please add return amount"] },
    rate:{type:Number, require: true },
    discount: { type: Number, required: [true, "Please add discount price"] },
    status: { type: Boolean, default: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'item' },
    brandId: { type: Schema.Types.ObjectId, ref: 'brand' },
    customerId: { type: Schema.Types.ObjectId, ref: 'customer' },
    modelNumber: { type: String, require: [true, "Please add model number"] },
    color: { type: String, require: [true, "Please add color"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('returnInvoice', returnInvoice)
