const mongoose = require('mongoose')
const Schema = mongoose.Schema

const uploadPdf = mongoose.Schema(
  {
    pdfName: { type: String, required: [true, "Please add pdf name"] },
    date: { type: String, required: [true, "Please add pdf date"] },
    publicId: { type: String, required: true },
    pdfUrl: { type: String, required: [true, "pdf URL not found"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('uploadPdf', uploadPdf)
