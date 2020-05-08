const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add user name"] },
    userName: { type: String, required: [true, "username cannot be empty"] },
    password: { type: String, required: [true, "Please add password"] },
    role: { type: String, required: [true, "role must be assign."] },
    status: { type: Boolean, default: [true, "Please add user status"] },
    userRoles: { type: Schema.Types.ObjectId, ref: 'userRoles' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('user', user)
