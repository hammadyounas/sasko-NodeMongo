const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const user = mongoose.Schema({
  
  name: { type: String, required: true },
  
})

user.plugin(uniqueValidator)

module.exports = mongoose.model('item', user)
