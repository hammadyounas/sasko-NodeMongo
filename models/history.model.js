const mongoose = require('mongoose')
const Schema = mongoose.Schema

const history = mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    changes: { type: String, required: true },
    description: { type: String, required: true },
    isType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('history', history)
