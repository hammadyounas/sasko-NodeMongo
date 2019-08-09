const mongoose = require('mongoose')

const brand = mongoose.Schema({
    itemId: String,
    data: [{
        itemId: { type: String, required: true },
        itemName: { type: String, required: true },
        BrandName: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    }]
})

module.exports = mongoose.model('brand', brand)
