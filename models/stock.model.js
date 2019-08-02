const mongoose = require('mongoose')

const stock = new Schema({
    date: {
        type: Date,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    },
    totalDamageQuantity: {
        type: Number,
        required: true
    },
    netCost: {
        type: Number,
        required: true
    },
    netQuantity: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('stock', stock);
