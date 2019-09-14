const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pettyCash = mongoose.Schema(
  {
    pettyCashTransactionId: { type: String, required: true },
    date: { type: String, required: true },
    pettyCashName: { type: String, required: true },
    cash: { type: Number, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('pettyCash', pettyCash)
