const express = require('express');

const routes = express.Router();
const bankController = require('../controllers/bank.controller');


console.log("Bank Route Loaded");

routes.get('/', bankController.getBank);
routes.post('/', bankController.setBank);
routes.put('/', bankController.editBank);
routes.delete('/:id', bankController.deleteBank);

module.exports = routes;