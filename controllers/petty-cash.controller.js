const mongoose = require('mongoose')
const PettyCash = require('../models/petty-cash.model')
const sixDigits = require('../utils/sixDigits')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getPettyCashTransactionId = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PettyCash.count()
        .then(length => {
          let id = sixDigits((length + 1).toString())
          res.status(200).send({ pettyCashTransactionId: id })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.setPettyCash = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PettyCash.findOne({
        pettyCashTransactionId: req.body.pettyCashTransactionId,
        date: req.body.date,
        pettyCashName: req.body.pettyCashName,
        cash: req.body.cash
      })
        .then(result => {
          if (!result) {
            PettyCash.create(req.body)
              .then(async createPettyCash => {
                let record = await historyController.addHistory(
                  req.body.history,
                  payload,
                  'Petty Cash',
                  'add'
                )
                res.status(200).send(createPettyCash)
              })
              .catch(err => {
                res.status(500).json(errorHandler(err))
              })
          } else {
            res.status(409).send({ msg: 'already exist this petty cash' })
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getPettyCashList = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PettyCash.find()
        .then(result => {
          if (result.length) {
            res.status(200).send(result)
          } else {
            res.status(404).send({ msg: 'No Data Found' })
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getPettyCashById = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PettyCash.findOne({ _id: req.params.id })
        .then(result => {
          res.status(200).send(result)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.updatePettyCash = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      // PettyCash.findOne({
      //   date: req.body.date,
      //   pettyCashName: req.body.pettyCashName,
      //   cash: req.body.cash
      // }).then(response => {
      //   if (!response) {
      PettyCash.findByIdAndUpdate({ _id: req.body._id }, req.body)
        .then(() => {
          PettyCash.findById({ _id: req.body._id })
            .then(async updatePettyCash => {
              let record = await historyController.addHistory(
                req.body.history,
                payload,
                'Payment Recieve',
                'update'
              )
              res.status(200).send(updatePettyCash)
            })
            .catch(err => {
              res.status(500).json(errorHandler(err))
            })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
      // } else {
      //   res
      //     .status(409)
      //     .send({ msg: 'this data is already exist on another petty cash' })
      // }
      // })
    }
  })
}

module.exports.deletePettyCash = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PettyCash.findByIdAndRemove({ _id: req.params.id })
        .then(resp => {
          res.status(200).send(resp)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}
