const express = require('express')

const routes = express.Router()
const stockController = require('../controllers/stock.controller')


console.log("Stock Route Loaded");

routes.get('/', stockController.getStock);
routes.get('/getStockId',stockController.getStockId)
routes.post('/', stockController.addStock);
routes.delete('/:id', stockController.deleteStock);
routes.put('/', stockController.editStock);
routes.post('/getStockWithStockDetails',stockController.getStockWithStockDetails)



module.exports = routes
