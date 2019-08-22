const express = require('express')

const routes = express.Router()
const stockController = require('../controllers/stock.controller')


console.log("Stock Route Loaded");

routes.get('/', stockController.getStock);
routes.post('/', stockController.addStock);
routes.delete('/:id', stockController.deleteStock);
routes.put('/', stockController.editStock);




module.exports = routes
