const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = mongoose.Schema(
  {
    name: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: Boolean, default: true },
    userRoles: { type: Schema.Types.ObjectId, ref: 'userRoles' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('user', user)
