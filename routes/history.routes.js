const express = require('express');

const routes = express.Router();
const historyController = require('../controllers/history.controller');

console.log("history Route Loaded");

routes.get('/getHistory', historyController.getHistory);

module.exports = routes;