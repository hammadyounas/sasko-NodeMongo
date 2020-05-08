const express = require('express')

const routes = express.Router()
const stockController = require('../controllers/stock.controller')

routes.get('/', stockController.getStock);
routes.get('/getStockId',stockController.getStockId)
routes.post('/', stockController.addStock);
routes.delete('/:id', stockController.deleteStock);
routes.put('/', stockController.editStock);
routes.get('/getStockWithStockDetails/:id',stockController.getStockWithStockDetails)



module.exports = routes
