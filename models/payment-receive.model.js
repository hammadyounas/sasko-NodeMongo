const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentReceive = mongoose.Schema(
    {
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        customerId: { type: Schema.Types.ObjectId, required: true, ref: "customer" },
        status: { type: Boolean, default: true },
        bankId: { type: Schema.Types.ObjectId, required: true, ref: "bank" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    {
        timestamps: { createdAt: true, updatedAt: true }
    }
);

module.exports = mongoose.model('payment-receive', paymentReceive);