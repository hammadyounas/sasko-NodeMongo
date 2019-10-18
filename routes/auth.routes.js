const express = require('express');

const routes = express.Router();
// const bankController = require('../controllers/bank.controller');
const authController = require('../controllers/auth.controller');

console.log("Bank Route Loaded");

// routes.get('/', bankController.getBank);
routes.get('/:token', authController.currentUser);
routes.post('/signin',authController.login);
// routes.put('/', bankController.editBank);
// routes.delete('/:id', bankController.deleteBank);

module.exports = routes;