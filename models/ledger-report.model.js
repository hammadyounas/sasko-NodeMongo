const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ledgerReport = mongoose.Schema(
  {
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, required: [true, "Please add balance"] },
    date: { type: Date, required: [true, "Please add date name"] },
    description: { type: String },
    customerId: { type: String, required: [true, "Please add customer name"], ref: 'customer' },
    bankId:{ type: String, ref: 'bank' },
    paymentReceiveId: { type: String, ref: 'payment-receive' },
    invoiceId: { type: String, ref: 'invoice' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('ledgerReport', ledgerReport)
