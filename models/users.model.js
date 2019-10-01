const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userInfo = mongoose.Schema(
  {
    name: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('userInfo', userInfo)
