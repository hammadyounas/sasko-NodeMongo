const express = require('express');

const routes = express.Router();
console.log("user Roles Route Loaded");
const UserRolesController = require('../controllers/user-roles.controller');

// const UserController = require('../controllers/users.controller')
routes.get('/:userId', UserRolesController.getUserRoles);
// routes.get('/getUserNameList', UserController.getUserNameList);
// routes.post('/', UserController.setUser );
// routes.put('/',UserController.updateUser );

module.exports = routes;
