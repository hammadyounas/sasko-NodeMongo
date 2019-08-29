const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const stockDetails = new Schema({
    stock: { type: Schema.Types.ObjectId, ref: 'stock' },
    stockId: { type: String, require: true },
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    brandId: { type: String, required: true },
    brandName: { type: String, required: true },
    modelNumber: { type: String, require: true },
    color: { type: String, require: true },
    size: { type: String, require: true },
    initialQty: { type: Number, require: true },
    damageQty: { type: Number, require: true },
    actualQty: { type: Number, require: true },
    unitCost: { type: Number, require: true },
    totalCost: { type: Number, require: true },
    date:{type:String,require:true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
        timestamps: { createdAt: true, updatedAt: true }
    });

module.exports = mongoose.model('stockDetails', stockDetails);
