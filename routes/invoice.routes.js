const express = require('express');

const routes = express.Router();
const invoiceController = require('../controllers/invoice.controller');


console.log("Invoice Route Loaded");

routes.get('/', invoiceController.getInvoice);
// routes.get('/getInvoicesSummery',invoiceController.getInvoicesSummery);
routes.post('/getSummeryDetails',invoiceController.getSummeryDetails)
routes.get('/getInvoiceId', invoiceController.getInvoiceId);
routes.get('/:id', invoiceController.getInvoiceById);
routes.get('/getInvoiceWithInvoiceDetails/:id', invoiceController.getInvoiceWithInvoiceDetails);
routes.get('/getCustomers', invoiceController.getCustomers);
routes.post('/', invoiceController.setInvoice);
routes.put('/', invoiceController.editInvoice);
routes.delete('/:id', invoiceController.deleteInvoice);

module.exports = routes;