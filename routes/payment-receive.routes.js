const express = require('express');

const routes = express.Router();
const paymentReceiveController = require('../controllers/payment-receive.controller');


console.log("PaymentReceive Route Loaded");

routes.get('/', paymentReceiveController.getPaymentReceive);
routes.get('/getTransactionId',paymentReceiveController.getTransactionId);
routes.get('/getLedgerReport',paymentReceiveController.getLedgerReport)
routes.get('/:id',paymentReceiveController.getPaymentDetailById)
routes.post('/', paymentReceiveController.setPaymentReceive);
// routes.put('/', paymentReceiveController.editPaymentReceive);
// routes.delete('/:id', paymentReceiveController.deletePaymentReceive);

module.exports = routes;