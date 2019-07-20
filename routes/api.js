const express = require('express');
const router = express.Router();
const Model = require('./../Schema')
// var jwt = require('jsonwebtoken')

//Geting Data
router.get('/users', function (req, res, next) {
    Model.userMod.find().then((data) => {
        res.send(data)
    })
})
 
module.exports = router;