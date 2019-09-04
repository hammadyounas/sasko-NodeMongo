const express = require('express');

const routes = express.Router();
const customerController = require('../controllers/customer.controller');


console.log("Customer Route Loaded");

routes.get('/', customerController.getCustomer);
routes.get('/:id', customerController.getCustomerById);
routes.post('/', customerController.setCustomer);
routes.put('/', customerController.editCustomer);
routes.delete('/:id', customerController.deleteCustomer);

module.exports = routes;