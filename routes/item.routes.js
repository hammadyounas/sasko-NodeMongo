const express = require('express')

const routes = express.Router()
const itemsController = require('../controllers/item.controller')

routes.get('/', itemsController.getItems);
routes.post('/', itemsController.addItems);
routes.delete('/:id', itemsController.deleteItems);
routes.put('/', itemsController.editItems);




module.exports = routes
