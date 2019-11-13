const Stock = require('../models/stock.model');
const StockDetails = require('../models/stock-details.model');
const Item = require('../models/item.model');
const Brands = require('../models/brand.model');
const sixDigits = require('../utils/sixDigits');
const historyController = require('./history.controller');
const jwt = require('jsonwebtoken');

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getStock = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Stock.find()
        .then(Stock => {
          res.send(Stock)
        })
        .catch(error => {
          res.send(error)
        })
    }
  })
}

module.exports.getStockId = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Stock.count()
        .then(length => {
          let id = sixDigits((length + 1).toString())
          res.status(200).send({ stockId: id })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.deleteStock = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Stock.remove({ _id: req.params.id })
        .then(Stock => {
          res.send(Stock)
        })
        .catch(error => {
          res.send(error)
        })
    }
  })
}

module.exports.editStock = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Stock.update({ _id: req.body.id }, { name: req.body.name })
        .then(Stock => {
          res.send(Stock)
        })
        .catch(error => {
          res.send(error)
        })
    }
  })
}

module.exports.addStock = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Stock.create(req.body)
        .then(function (ninja) {
          res.send(ninja)
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

module.exports.getStockWithStockDetails = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let stock = await Stock.findOne({ _id: req.params.id })
        let stockDetails = await StockDetails.find({
          stock: req.params.id
        })
          .populate('itemId', 'name')
          .populate('brandId', 'brandName')
          .lean()
        Promise.all(
          stockDetails.map((stockDetail, i) => {
            stockDetails[i]['itemName'] = stockDetail.itemId.name
            stockDetails[i]['brandName'] = stockDetail.brandId.brandName
            stockDetails[i]['itemId'] = stockDetail.itemId._id
            stockDetails[i]['brandId'] = stockDetail.brandId._id
          })
        ).then(() => {
          let obj = { stock, stockDetails }
          res.status(200).send(obj)
        })
      } catch (err) {
        res.status(500).send(errorHandler(err))
      }
    }
  })
}
