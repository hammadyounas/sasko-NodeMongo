const express = require('express');
const items = require('./item.routes');
const brands = require('./brand.routes');

const routes = express.Router();
console.log("iteeeemmms");

routes.use('/item', items);
routes.use('/brand', brands);

module.exports = routes 