const express = require('express');

const routes = express.Router();
const bankController = require('../controllers/bank.controller');

routes.get('/', bankController.getBank);
routes.get('/getBankLedgerListing',bankController.getBankListing);
routes.get('/:id', bankController.getBankById);
routes.post('/', bankController.setBank);
routes.put('/', bankController.editBank);
routes.delete('/:id', bankController.deleteBank);

module.exports = routes;