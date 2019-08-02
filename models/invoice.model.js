const mongoose = require('mongoose')


const invoice = new Schema({
    date: {
        type: Date,
        required: true
    },
    customerId: {
        type: String,
        required: true
    },
    manualBook: {
        type: Number,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    },
    totalNetCost: {
        type: Number,
        required: true
    },
    postedStatus: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('invoice', invoice)
