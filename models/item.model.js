const mongoose = require('mongoose')

const Items = mongoose.Schema({
  
  name: { type: String, required: true },
  
})


module.exports = mongoose.model('item', Items)
