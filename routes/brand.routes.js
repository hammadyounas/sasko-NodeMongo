const express = require('express')

const routes = express.Router()
const brandController = require('../controllers/brands.controller')


console.log("Brand Route Loaded");

routes.get('/', brandController.getBrands);
routes.post('/getItemBrands',brandController.getItemBrands)
routes.post('/', brandController.addBrands);
routes.put('/', brandController.editBrands);
routes.delete('/:brandId', brandController.deleteBrands);

module.exports = routes
