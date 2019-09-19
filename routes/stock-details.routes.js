const express = require('express')

const routes = express.Router()
const stockDetails = require('../controllers/stock-details.controller')


console.log("Stock-Details Route Loaded");

routes.get('/getStockDetails', stockDetails.getStockDetails);
routes.post('/', stockDetails.addStockDetailsWithStock);
routes.delete('/:id', stockDetails.deleteStockDetails);
routes.put('/', stockDetails.editStockDetails);
routes.get('/stockSecondReport',stockDetails.getStockSecondReport);
routes.get('/getStockSummary',stockDetails.getStockSummary);
routes.get('/getDamageStock',stockDetails.getDamageStock);
routes.get('/getItemsInStockDetails',stockDetails.getItemsInStockDetails);
routes.get('/getBrandsOfItemsInStockDetails/:itemId',stockDetails.getBrandsOfItemsInStockDetails);
routes.post('/getModelsOfItemsAndBrands',stockDetails.getModelsOfItemsAndBrands);
routes.post('/getColorsOfModelsItemsAndBrands',stockDetails.getColorsOfModelsItemsAndBrands);
routes.post('/getStockOfColorModelItemAndBrand',stockDetails.getStockOfColorModelItemAndBrand);
module.exports = routes
