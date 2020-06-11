const express = require('express');

const routes = express.Router();

const UserController = require('../controllers/users.controller')
routes.get('/', UserController.getUser);
routes.get('/getUserNameList', UserController.getUserNameList);
routes.post('/', UserController.setUser );
routes.post('/deleteUser', UserController.deleteUser );
routes.put('/',UserController.updateUser );

module.exports = routes;
