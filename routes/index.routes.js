const express = require('express')
const items = require('./item.routes')
const routes = express.Router()
console.log("iteeeemmms")

routes.use('/item', items)
module.exports = routes 