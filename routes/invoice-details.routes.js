const express = require('express');

const routes = express.Router();
const invoiceDetailsController = require('../controllers/invoice-details.controller');


console.log("Invoice Details Route Loaded");

routes.get('/', invoiceDetailsController.getInvoiceDetails);
routes.post('/', invoiceDetailsController.setInvoiceDetails);
routes.put('/', invoiceDetailsController.editInvoiceDetails);
routes.delete('/:id', invoiceDetailsController.deleteInvoiceDetails);

module.exports = routes;