const mongoose = require('mongoose')
const Schema = mongoose.Schema

const invoice = new Schema(
  {
    date: { type: Date, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'customer' },
    invoiceNo: { type: String },
    manualBookNo: { type: String, required: [true, "Please add manual book number"] },
    totalQty: { type: Number, required: [true, "Please add total quantity"] },
    totalNetCost: { type: Number, required: [true, "Please add total net cost"] },
    postedStatus: { type: Boolean, default: false },
    balance: { type: Number, required: [true, "Please add balance"] },
    status: { type: Boolean, default: true },
    returnStatus:{type:Boolean,default: false},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('invoice', invoice)
