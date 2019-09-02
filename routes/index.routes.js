const express = require('express');
const items = require('./item.routes');
const brands = require('./brand.routes');
const stock = require('./stock.routes');
const stockDetails = require('./stock-details.routes');
const customer = require('./customer.routes');
const invoice = require('./invoice.routes');
const invoiceDetails = require('./invoice-details.routes');

const routes = express.Router();
console.log("iteeeemmms");

routes.use('/item', items);
routes.use('/brand', brands);
routes.use('/stock', stock);
routes.use('/stockDetails', stockDetails);
routes.use('/customer', customer);
routes.use('/invoice', invoice);
routes.use('/invoiceDetails', invoiceDetails);

module.exports = routes;