const express = require('express');

const routes = express.Router();
const historyController = require('../controllers/history.controller');

routes.get('/getHistory', historyController.getHistory);

module.exports = routes;