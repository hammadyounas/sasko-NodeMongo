const express = require('express')

const routes = express.Router()
const brandController = require('../controllers/brands.controller')

routes.get('/', brandController.getBrands);
routes.post('/getItemBrands',brandController.getItemBrands)
routes.post('/', brandController.addBrands);
routes.put('/', brandController.editBrands);
routes.delete('/:id', brandController.deleteBrands);
routes.get('/getBrandsWithItems',brandController.getBrandsWithItems);

module.exports = routes
