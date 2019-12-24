const Brands = require('../models/brand.model')
const Items = require('../models/item.model')
const utilFunction = require('../utils/ReplaceName')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getBrandsWithItems = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let brands = await Brands.find()
        let arr = []
        Promise.all(
          brands.map(async obj => {
            let item = await Items.findOne({ _id: obj.itemId })
            let tempObj = {
              brandName: obj.brandName,
              _id: obj._id,
              itemId: obj.itemId,
              createdAt: obj.createdAt,
              updatedAt: obj.updatedAt,
              itemName: item.name
            }
            arr.push(tempObj)
          })
        ).then(result => {
          res.status(200).send(arr)
        })
      } catch (err) {
        res.status(500).send({ msg: 'internal server error' })
      }
    }
  })
}

module.exports.getBrands = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      // return res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let brands = await Brands.find().populate('itemId');

        if(!brands.length) return res.status(404).send({ msg: 'No Data Found' })
        // if (brands.length) {
          return res.status(200).send(brands)
        // } else {
        //   res.status(404).send({ msg: 'No Data Found' })
        // }
      } catch (err) {
        return res.status(500).send({ msg: 'internal server error' })
      }
    }
  }).catch(err =>{
    return res.send(401).send({ message: 'not authentic user' })

  })
}

module.exports.addBrands = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      let brands = req.body.brands
      let addBrands = []
      Promise.all(
        brands.map(async obj => {
          let resp = await Brands.findOne({
            itemId: obj.itemId,
            brandName: obj.brandName
          })
          if (!resp) {
            addBrands.push(obj)
          }
        })
      ).then(result => {
        Brands.create(addBrands)
          .then(async function (brands) {
            let record = await historyController.addHistory(
              req.body.history,
              payload,
              'Brand',
              'add',
              0
            )
            res.status(200).send(brands)
          })
          .catch(error => {
            res.status(500).json(errorHandler(error))
          })
      })
    }
  })
}

module.exports.editBrands = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      obj = req.body
      let resp = await Brands.findOne({
        itemId: obj.itemId,
        brandName: obj.brandName
      })
      if (!resp) {
        Brands.findByIdAndUpdate(
          { _id: req.body._id },
          { brandName: req.body.brandName, itemId: req.body.itemId._id },
          { new: true }
        ).exec(async (error, doc) => {
          if (error) res.status(500).json(errorHandler(error))
          let record = await historyController.addHistory(
            req.body.history,
            payload,
            'Brand',
            'update',
            0
          )
          res.status(200).send(doc)
        })
      } else {
        res
          .status(409)
          .send({ msg: 'conflict with same item name and brand name' })
      }
    }
  })
}

module.exports.deleteBrands = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Brands.remove({ _id: req.params.id })
        .then(brands => {
          res.send(brands)
        })
        .catch(error => {
          res.status(500).json(errorHandler(error))
        })
    }
  })
}

module.exports.getItemBrands = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let getItemBrands = await Brands.find({ itemId: req.body.itemId })
        utilFunction
          .replace(getItemBrands, Items)
          .then(data => {
            res.send(data)
          })
          .catch(error => {
            res.status(500).json(errorHandler(error))
          })
      } catch (error) {
        res.status(500).send(errorHandler(error))
      }
    }
  })
}
