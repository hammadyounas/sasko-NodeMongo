const express = require('express');

const routes = express.Router();
// const bankController = require('../controllers/bank.controller');
const authController = require('../controllers/auth.controller');

routes.get('/:token', authController.currentUser);
routes.post('/signin',authController.login);

module.exports = routes;