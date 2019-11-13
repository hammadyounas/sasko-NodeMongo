const Items = require('../models/item.model')
const jwt = require('jsonwebtoken')
const History = require('../models/history.model')
const historyController = require('./history.controller')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getItems = (req, res) => {
  console.log('req.query.token', req.query.token)
  if (req.query.token != undefined) {
    jwt.verify(req.query.token, 'secretOfSasscoTraders', function (
      err,
      payload
    ) {
      if (err) {
        res.status(401).send({ message: 'not authentic user' })
      } else {
        Items.find()
          .then(Items => {
            if (Items.length) {
              res.status(200).send(Items)
            } else {
              res.status(404).send({ msg: 'No Data Found' })
            }
          })
          .catch(error => {
            res.status(500).json(errorHandler(error))
          })
      }
    })
  }else{
    res.status(401).send({ message: 'not authentic user' });
  }
}

module.exports.deleteItems = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Items.remove({ _id: req.params.id })
        .then(Items => {
          res.send(Items)
        })
        .catch(error => {
          res.send(error)
        })
    }
  })
}

module.exports.editItems = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Items.findOne({ name: req.body.name })
        .then(async result => {
          if (!result) {
            Items.findByIdAndUpdate(
              { _id: req.body._id },
              { name: req.body.name },
              { new: true }
            ).exec(async (error, doc) => {
              if (error) res.send(error)
              let record = await historyController.addHistory(
                req.body.history,
                payload,
                'Item',
                'update',
                0
              )
              res.send(doc)
            })
          } else {
            res.status(409).send({ msg: 'item already exist' })
          }
        })
        .catch(error => {
          res.send(500).json({
            stack: error.stack,
            code: error.code,
            message: error.message
          })
        })
    }
  })
}

// async function addHistory (obj, payload, feature, type) {

// }

module.exports.addItems = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Items.findOne({ name: req.body.name })
        .then(result => {
          if (!result) {
            Items.create(req.body)
              .then(async ninja => {
                let record = await historyController.addHistory(
                  req.body.history,
                  payload,
                  'item',
                  'add',
                  0
                )
                res.send(ninja)
              })
              .catch(error => {
                res.send(500).json({
                  stack: error.stack,
                  code: error.code,
                  message: error.message
                })
              })
          } else {
            res.status(409).send({ msg: 'item already exist' })
          }
        })
        .catch(error => {
          res.send(500).json({
            stack: error.stack,
            code: error.code,
            message: error.message
          })
        })
    }
  })
}
