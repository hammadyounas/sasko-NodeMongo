const express = require('express');
const router = express.Router();
const Model = require('./../Schema')

// Get Data
router.get('/items', function (req, res, next) {
    Model.itemMod.find().then((data) => {
        res.send(data)
    })
})
// Adding Data
router.post('/items', function (req, res, next) {
    Model.itemMod.create(req.body).then(function (ninja) {
        res.send(ninja) 
    }).catch(next)
})
// Updating Data 
router.put('/items/:id', function (req, res, next) {
    Model.itemMod.findByIdAndUpdate({ _id: req.params.id }, req.body).then(function () {
        Model.itemMod.findOne({ _id: req.params.id }).then(function (ninja) {
            res.send(ninja)
        })
    });
})
// Delete Data
router.delete('/items/:id', function (req, res, next) {
    Model.itemMod.findByIdAndRemove({ _id: req.params.id }).then(function (ninja) {
        res.send(ninja)
    });
});

// Get Data
router.get('/brand', function (req, res, next) {
    Model.brandMod.find().then((data) => {
        res.send(data)
    })
})
// Adding Data
router.post('/brand', function (req, res, next) {
    Model.brandMod.create(req.body).then(function (ninja) {
        res.send(ninja)
    }).catch(next)
})
// Updating Data
router.put('/brand/:id',function (req, res, next) {
    Model.brandMod.findByIdAndUpdate({ _id: req.params.id }, req.body).then(function () {
        Model.brandMod.findOne({ _id: req.params.id }).then(function (ninja) {
            res.send(ninja)
        })
    });
})
// Delete Data
router.delete('/brand/:id', function (req, res, next) {
    Model.brandMod.findByIdAndRemove({ _id: req.params.id }).then(function (ninja) {
        res.send(ninja)
    });
});

// Get Data
router.get('/customer', function (req, res, next) {
    Model.custMod.find().then((data) => {
        res.send(data)
    })
})
// Adding Data
router.post('/customer', function (req, res, next) {
    Model.custMod.create(req.body).then(function (ninja) {
        res.send(ninja)
    }).catch(next)
})
// Updating Data
router.put('/customer/:id',function (req, res, next) {
    Model.custMod.findByIdAndUpdate({ _id: req.params.id }, req.body).then(function () {
        Model.custMod.findOne({ _id: req.params.id }).then(function (ninja) {
            res.send(ninja)
        })
    });
})
// Delete Data
router.delete('/customer/:id',  function (req, res, next) {
    Model.custMod.findByIdAndRemove({ _id: req.params.id }).then(function (ninja) {
        res.send(ninja)
    });
});

module.exports = router;