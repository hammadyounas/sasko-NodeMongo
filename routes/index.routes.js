const express = require('express')
const user = require('./item.routes')
const routes = express.Router()

routes.use('/item', user)
// routes.post('/item', user)
module.exports = routes 