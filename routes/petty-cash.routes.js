const express = require('express');

const routes = express.Router();
const PettyCashController = require('../controllers/petty-cash.controller');

routes.get('/getPettyCashTransactionId',PettyCashController.getPettyCashTransactionId);
routes.get('/', PettyCashController.getPettyCashList);
routes.get('/:id', PettyCashController.getPettyCashById);
routes.post('/',PettyCashController.setPettyCash );
routes.put('/', PettyCashController.updatePettyCash);
// routes.delete('/:id', PettyCashController.deletePettyCash);

module.exports = routes;