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
const userInfo = require('./users.routes');
const userRoles = require('./user-roles.routes');
const authRoutes = require('./auth.routes');
const historyRoutes = require('./history.routes');

const routes = express.Router();

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
routes.use('/users',userInfo);
routes.use('/usersRoles',userRoles);
routes.use('/auth',authRoutes);
routes.use('/history',historyRoutes);

module.exports = routes;