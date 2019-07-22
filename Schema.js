const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name field is Required']
    }
});
const itemModel = mongoose.model('item', itemSchema);

module.exports = {
    itemMod: itemModel,
}