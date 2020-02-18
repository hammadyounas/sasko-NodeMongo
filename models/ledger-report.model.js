const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ledgerReport = mongoose.Schema(
  {
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    customerId: { type: String, required: true, ref: 'customer' },
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
