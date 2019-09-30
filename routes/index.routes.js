const express = require('express');
const items = require('./item.routes');
const brands = require('./brand.routes');
const stock = require('./stock.routes');
const stockDetails = require('./stock-details.routes');
const customer = require('./customer.routes');
const invoice = require('./invoice.routes');
const invoiceDetails = require('./invoice-details.routes');
const bank = require('./bank.routes');
const paymentReceive = require('./payment-receive.routes');
const pettyCash = require('./petty-cash.routes');
const returnInvoice = require('./return-invoice.routes');
const uploadPdf = require('./uploadPdf.routes');

const routes = express.Router();
console.log("iteeeemmms");

routes.use('/item', items);
routes.use('/brand', brands);
routes.use('/stock', stock);
routes.use('/stockDetails', stockDetails);
routes.use('/customer', customer);
routes.use('/invoice', invoice);
routes.use('/invoiceDetails', invoiceDetails);
routes.use('/bank', bank);
routes.use('/paymentReceive', paymentReceive);
routes.use('/pettyCash',pettyCash);
routes.use('/returnInvoice',returnInvoice);
routes.use('/uploadPdf',uploadPdf);

module.exports = routes;