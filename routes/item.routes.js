const express = require('express')

const routes = express.Router()
const adminController = require('../controllers/item.controller')


console.log("Item Route Loaded");

routes.get('/', adminController.getTeam)
routes.post('/', adminController.addItem)

module.exports = routes
