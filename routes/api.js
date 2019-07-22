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

module.exports = router;