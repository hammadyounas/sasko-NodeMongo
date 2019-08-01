const express = require('express')

const routes = express.Router()
const adminController = require('../controllers/item.controller')

routes.get('/item', adminController.getTeam)
routes.post('/additem', adminController.addItem)
// routes.post('/getDistributorCareer',distributorsController.getDsitributorCareerProfile);

module.exports = routes
