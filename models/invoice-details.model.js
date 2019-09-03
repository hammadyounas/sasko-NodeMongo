const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const invoiceDetails = new Schema({
    invoiceId: { type: Schema.Types.ObjectId, ref: 'invoice' },
    stockDetailId: { type: Schema.Types.ObjectId, ref: 'stockDetails' },
    itemName: { type: String, required: true },
    brandName: { type: String, required: true },
    model: { type: String, required: true },
    pieceQty: { type: Number, required: true },
    discount: { type: Number, required: true },
    afterDiscount: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
},
    {
        timestamps: { createdAt: true, updatedAt: true }
    }
);

module.exports = mongoose.model('invoiceDetails', invoiceDetails);