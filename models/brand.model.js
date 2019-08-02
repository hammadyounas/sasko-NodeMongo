const mongoose = require('mongoose')

const brand = mongoose.Schema({
    name: { type: String, required: true },
    itemId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('brand', brand)
