const mongoose = require('mongoose')

const customer = mongoose.Schema({
  
  name: { type: String, required: true },
  
})


module.exports = mongoose.model('customer', customer)
