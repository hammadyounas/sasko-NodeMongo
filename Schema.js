const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name field is Required']
    },
    type: {
        type: String,
        required: [true, 'Type field is Required']
    }
});
const usersModel = mongoose.model('users', usersSchema);

module.exports = {
    userMod: usersModel,
}