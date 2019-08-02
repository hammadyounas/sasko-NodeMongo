const express = require('express')

const routes = express.Router()
const adminController = require('../controllers/item.controller')

routes.get('/item', adminController.getTeam)
routes.post('/item', adminController.addItem)

module.exports = routes
