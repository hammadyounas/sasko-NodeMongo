const express = require('express');

const routes = express.Router();
const invoiceDetailsController = require('../controllers/invoice-details.controller');

routes.get('/', invoiceDetailsController.getInvoiceDetails);
routes.get('/getInvoiceDetailWithInvoice/:id',invoiceDetailsController.getInvoiceDetailWithInvoice)
routes.post('/', invoiceDetailsController.addInvoiceDetailsWithInvoice);
routes.post('/addDamageSale',invoiceDetailsController.addDamageSaleInvoiceDetailsWithInvoice)
routes.put('/', invoiceDetailsController.editInvoiceDetailsWithInvoice);
routes.delete('/:id', invoiceDetailsController.deleteInvoiceDetails);
routes.get('/modelColorWiseSale',invoiceDetailsController.modelColorWiseSale)

module.exports = routes;