const mongoose = require('mongoose');

const customer = mongoose.Schema({
  companyName: { type: String, required: true },
  clientName: { type: String, required: true },
  address: { type: String },
  contact1: { type: String },
  contact2: { type: String },
  area: { type: String },
  city: { type: String },
  email: { type: String },
  website: { type: String },
  stRegisteration: { type: String },
  aboutCompany: { type: String },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

module.exports = mongoose.model('customer', customer);