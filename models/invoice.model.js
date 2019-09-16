const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoice = new Schema({
    date: { type: Date,required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'customer' },
    invoiceNo: {type: String},
    manualBookNo: { type: String, required: true},
    totalQty: { type: Number, required: true},
    totalNetCost: { type: Number, required: true },
    postedStatus: {   type: Boolean,  default: false },
    balance: {   type: Number, required: true },
    status: {   type: Boolean, default: true},
    createdAt: {  type: Date,  default: Date.now},
    updatedAt: {   type: Date,  default: Date.now  }
},
    {
        timestamps: { createdAt: true, updatedAt: true }
    }
);

module.exports = mongoose.model('invoice', invoice);
