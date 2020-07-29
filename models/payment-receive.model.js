const mongoose = require('mongoose')
const Schema = mongoose.Schema

const paymentReceive = mongoose.Schema(
  {
    amount: { type: Number, required: [true, "Please add amount"] },
    date: { type: Date, required: true },
    transactionId: { type: String, required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      required: [true, "Please add customer name"],
      ref: 'customer'
    },
    status: { type: Boolean, default: true },
    bankId: { type: Schema.Types.ObjectId, required: [true, "Please add bank name"], ref: 'bank' },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('payment-receive', paymentReceive)
