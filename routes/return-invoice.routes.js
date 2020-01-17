const express = require('express');

const routes = express.Router();
const returnInvoiceController = require('../controllers/return-invoice.controller');


console.log("Invoice Route Loaded");

routes.get('/', returnInvoiceController.getReturnInvoice);
routes.get('/getReturnInvoiceId', returnInvoiceController.getReturnInvoiceId);
// routes.get('/:id', invoiceController.getInvoiceById);
// routes.get('/getInvoiceWithInvoiceDetails/:id', invoiceController.getInvoiceWithInvoiceDetails);
// routes.get('/getCustomers', invoiceController.getCustomers);
// routes.post('/', returnInvoiceController.setReturnInvoice);
routes.get('/returnWholeInvoice/:invoiceId',returnInvoiceController.returnWholeInvoice)
// routes.put('/', invoiceController.editInvoice);
// routes.delete('/:id', invoiceController.deleteInvoice);

module.exports = routes;