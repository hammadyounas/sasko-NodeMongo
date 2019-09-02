const express = require('express');

const routes = express.Router();
const invoiceController = require('../controllers/invoice.controller');


console.log("Invoice Route Loaded");

routes.get('/', invoiceController.getInvoice);
routes.post('/', invoiceController.setInvoice);
routes.put('/', invoiceController.editInvoice);
routes.delete('/:id', invoiceController.deleteInvoice);

module.exports = routes;