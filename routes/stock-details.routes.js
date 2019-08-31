const express = require('express')

const routes = express.Router()
const stockDetails = require('../controllers/stock-details.controller')


console.log("Stock-Details Route Loaded");

routes.get('/', stockDetails.getStockDetails);
routes.post('/', stockDetails.addStockDetailsWithStock);
routes.delete('/:id', stockDetails.deleteStockDetails);
routes.put('/:id', stockDetails.editStockDetails);
routes.get('/stockSecondReport',stockDetails.getStockSecondReport);
routes.get('/getStockSummary',stockDetails.getStockSummary);
routes.get('/getDamageStock',stockDetails.getDamageStock);

module.exports = routes