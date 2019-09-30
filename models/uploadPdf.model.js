const mongoose = require('mongoose')
const Schema = mongoose.Schema

const uploadPdf = mongoose.Schema(
  {
    pdfName: { type: String, required: true },
    date: { type: String, required: true },
    publicId: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('uploadPdf', uploadPdf)
