const express = require('express');

const routes = express.Router();
const UserRolesController = require('../controllers/user-roles.controller');

routes.get('/:userId', UserRolesController.getUserRoles);
routes.put('/',UserRolesController.updateUserRoles);

module.exports = routes;
