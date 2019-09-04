const mongoose = require('mongoose');

const bank = mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    accountNo: { type: String, required: true },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

module.exports = mongoose.model('bank', bank);