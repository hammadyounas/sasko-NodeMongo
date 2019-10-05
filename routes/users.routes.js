const express = require('express');

const routes = express.Router();
console.log("user Route Loaded");

const UserController = require('../controllers/users.controller')
// const PettyCashController = require('../controllers/petty-cash.controller');

// routes.get('/getPettyCashTransactionId',PettyCashController.getPettyCashTransactionId);
routes.get('/', UserController.getUser);
// routes.get('/auth', UserController.getAuth);

// routes.get('/:id', PettyCashController.getPettyCashById);
routes.post('/', UserController.setUser );
routes.put('/',UserController.updateUser );
// routes.delete('/:id', PettyCashController.deletePettyCash);

module.exports = routes;
