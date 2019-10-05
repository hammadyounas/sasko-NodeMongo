const express = require('express');

const routes = express.Router();
console.log("user Route Loaded");

const UserController = require('../controllers/users.controller')
routes.get('/', UserController.getUser);
routes.get('/getUserNameList', UserController.getUserNameList);
routes.post('/', UserController.setUser );
routes.put('/',UserController.updateUser );

module.exports = routes;
