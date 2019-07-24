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
        required: [true, 'Item Id  field is Required']
    },
    createdDate:{
        type: Date,
        required: [true, 'Created Date field is Required']
    },
    updatedDate:{
        type: Date,
        required: [true, 'Updated Date field is Required']
    }
});
const brandModel = mongoose.model('brand', brandSchema);

const customerSchema = new Schema({
    name: {
        type: String,
        required: [true, 'brand name  field is Required']
    }
});
const customerModel = mongoose.model('customer', customerSchema);

const invoiceSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Date field is Required']
    },
    customerId: {
        type: String,
        required: [true, 'Customer Id field is Required']
    },
    manualBook: {
        type: Number,
        required: [true, 'Manual Book field is Required']
    },
    totalQuantity: {
        type: Number,
        required: [true, 'Total Quantity field is Required']
    },
    totalNetCost: {
        type: Number,
        required: [true, 'Total Net Cost field is Required']
    },
    postedStatus: {
        type: Number,
        required: [true, 'Posted Status field is Required'],
        default: 0
    }
});
const invoiceModel = mongoose.model('invoice', invoiceSchema);

const stockSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'Date field is Required']
    },
    totalQuantity: {
        type: Number,
        required: [true, 'Total Quantity field is Required']
    },
    totalDamageQuantity: {
        type: Number,
        required: [true, 'Total Damage Quantity field is Required']
    },
    netCost: {
        type: Number,
        required: [true, 'Net Cost field is Required'],
    },
    netQuantity: {
        type: Number,
        required: [true, 'Net Quantity field is Required']
    }
});
const stockModel = mongoose.model('stock', stockSchema);

module.exports = {
    itemMod: itemModel,
    brandMod: brandModel,
    custMod: customerModel,
    invMod: invoiceModel,
    stocMod:stockModel
}