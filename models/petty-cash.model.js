const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pettyCash = mongoose.Schema(
  {
    pettyCashTransactionId: { type: String, required: [true, "petty cash id not found"] },
    date: { type: String, required: [true, "Please add date"] },
    pettyCashName: { type: String, required: [true, "Please add petty cash name"] },
    cash: { type: Number, required: [true, "Please add cash"] },
    description: { type: String },
    bankId:{ type: String, ref: 'bank' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('pettyCash', pettyCash)
