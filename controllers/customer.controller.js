const Customer = require('../models/customer.model')
const errorHandler = require('../utils/errorHandler')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

module.exports.getCustomer = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Customer.find({ status: true })
        .then(customers => {
          if (customers.length) {
            res.status(200).send(customers)
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

module.exports.getCustomerById = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Customer.findById({ _id: req.params.id, status: true })
        .then(customer => {
          res.status(200).send(customer)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.setCustomer = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Customer.findOne({
        clientName: req.body.clientName,
        companyName: req.body.companyName
      })
        .then(result => {
          if (!result) {
            Customer.create(req.body)
              .then(async customer => {
                let record = await historyController.addHistory(
                  req.body.history,
                  payload,
                  'Customer',
                  'add'
                )
                res.status(200).send(customer)
              })
              .catch(err => {
                res.status(500).json(errorHandler(err))
              })
          } else {
            res.status(409).send({ msg: 'customer already exist' })
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.editCustomer = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Customer.findOne({
        clientName: req.body.clientName,
        companyName: req.body.companyName
      })
        .then(result => {
          if (!result) {
            Customer.findByIdAndUpdate(
              { _id: req.body._id, status: true },
              req.body
            )
              .then(() => {
                Customer.findById({ _id: req.body._id })
                  .then(async customer => {
                    let record = await historyController.addHistory(
                      req.body.history,
                      payload,
                      'Customer',
                      'update'
                    )
                    res.status(200).send(customer)
                  })
                  .catch(err => {
                    res.status(500).json(errorHandler(err))
                  })
              })
              .catch(err => {
                res.status(500).json(errorHandler(err))
              })
          } else {
            res.status(409).send({ msg: 'customer already exist' })
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.deleteCustomer = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Customer.findByIdAndUpdate(
        { _id: req.params.id, status: true },
        { $set: { status: false } }
      )
        .then(() => {
          Customer.findById({ _id: req.params.id })
            .then(customer => {
              res.status(200).send(customer)
            })
            .catch(err => {
              res.status(500).json(errorHandler(err))
            })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}
