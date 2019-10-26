const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userRoles = mongoose.Schema(
  {
    addAndViewItem:{ type: Boolean, default: false },
    addAndUpdateBrand:{ type: Boolean, default: false },
    brandListing:{ type: Boolean, default: false },
    addStock: { type: Boolean, default: false },
    viewStock: { type: Boolean, default: false },
    stockSummery: { type: Boolean, default: false },
    stockReport: { type: Boolean, default: false },
    addInvoice: { type: Boolean, default: false },
    viewInvoice: { type: Boolean, default: false },
    invoiceReport: { type: Boolean, default: false },
    colorModelWise: { type: Boolean, default: false },
    updateAndCreateLedger: { type: Boolean, default: false },
    recieveMoneyReport: { type: Boolean, default: false },
    ledgerReport: { type: Boolean, default: false },
    updateAndCreateBank: { type: Boolean, default: false },
    bankListing: { type: Boolean, default: false },
    bankLedger: { type: Boolean, default: false },
    updateAndCreatePettyCash: { type: Boolean, default: false },
    pettyCashListing: { type: Boolean, default: false },
    uploadPdf: { type: Boolean, default: false },
    pdfListing: { type: Boolean, default: false },
    updateAndCreateCustomer: { type: Boolean, default: false },
    customerListing: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
)

module.exports = mongoose.model('userRoles', userRoles)
