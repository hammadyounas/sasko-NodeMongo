const express = require('express');

const routes = express.Router();
const invoiceDetailsController = require('../controllers/invoice-details.controller');


console.log("Invoice Details Route Loaded");

routes.get('/', invoiceDetailsController.getInvoiceDetails);
routes.post('/', invoiceDetailsController.addInvoiceDetailsWithInvoice);
routes.put('/', invoiceDetailsController.editInvoiceDetailsWithInvoice);
routes.delete('/:id', invoiceDetailsController.deleteInvoiceDetails);
routes.get('/modelColorWiseSale',invoiceDetailsController.modelColorWiseSale)

module.exports = routes;