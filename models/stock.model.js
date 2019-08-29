const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Items = require('../models/stock-details.model');


const stock = new Schema({
    _id: Schema.Types.ObjectId,
    stockId: { type: String, require: true },
    date: { type: String, required: true },  
    totalQuantity: { type: Number, required: true },
    totalDamageQuantity: { type: Number, required: true },
    netCost: { type: Number, required: true },
    netQuantity: { type: Number, required: true },
    // stockDetails: [{ type: Schema.Types.ObjectId, ref: 'stockDetails' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    }, {
        timestamps: { createdAt: true, updatedAt: true }
    });

module.exports = mongoose.model('stock', stock);
