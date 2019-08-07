const express = require('express')

const routes = express.Router()
const brandController = require('../controllers/brands.controller')


console.log("Item Route Loaded");

routes.get('/', brandController.getBrands)
routes.post('/', brandController.addBrands)
routes.put('/', brandController.editBrands)
routes.delete('/', brandController.deleteBrands)

module.exports = routes
