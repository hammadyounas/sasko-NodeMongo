const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const returnInvoice = new Schema({
    date: { type: Date,required: true },
    invoiceDetailId: { type: Schema.Types.ObjectId, ref: 'invoiceDetails' },
    returnInvoiceNo: {type: String},
    returnQty: { type: Number, required: true},
    damageQty: { type: Number, required: true },
    totalReturnQty: {   type: Number,  default: false },
    status: {   type: Boolean, default: true},
    itemId: { type: Schema.Types.ObjectId, ref: 'item' },
    brandId: { type: Schema.Types.ObjectId, ref: 'brand' },
    modelNumber: { type: String, require: true },
    color: { type: String, require: true },
    size: { type: String, require: true },
    createdAt: {  type: Date,  default: Date.now},
    updatedAt: {   type: Date,  default: Date.now  }
},
    {
        timestamps: { createdAt: true, updatedAt: true }
    }
);

module.exports = mongoose.model('returnInvoice', returnInvoice);
