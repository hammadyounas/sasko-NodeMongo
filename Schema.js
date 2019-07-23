const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'item name field is Required']
    }
});
const itemModel = mongoose.model('item', itemSchema);

const brandSchema = new Schema({
    name: {
        type: String,
        required: [true, 'brand name field is Required']
    },
    itemId: {
        type: String,
        required: [true, 'Item Id field is Required']
    }
});
const brandModel = mongoose.model('brand', brandSchema);

const customerSchema = new Schema({
    name: {
        type: String,
        required: [true, 'brand name field is Required']
    }
});
const customerModel = mongoose.model('customer', customerSchema);
module.exports = {
    itemMod: itemModel,
    brandMod: brandModel,
    custMod: customerModel
}