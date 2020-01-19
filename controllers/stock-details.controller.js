const mongoose = require('mongoose')
const StockDetails = require('../models/stock-details.model')
const Stock = require('../models/stock.model')
const Item = require('../models/item.model')
const Brands = require('../models/brand.model')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getStockDetails = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let stockDetails = await StockDetails.find()
          .populate('itemId', 'name')
          .populate('brandId', 'brandName')
          .populate('stock', 'stockId')
        if (stockDetails.length) {
          res.status(200).send(stockDetails)
        } else {
          res.status(404).send({ msg: 'No Data Found' })
        }
      } catch (err) {
        res.status(500).send({ msg: 'Internal Server Error' })
      }
    }
  })
}

module.exports.deleteStockDetails = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      StockDetails.findOneAndRemove({ _id: req.params.id })
        .then(StockDetails => {
          res.send(StockDetails)
        })
        .catch(error => {
          res.send(error)
        })
    }
  })
}

module.exports.editStockDetails = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let updatedArray = []
        let stockHistory = req.body.stock.history
        delete req.body.stock['history']
        const stock = await Stock.findByIdAndUpdate(
          { _id: req.body.stock._id },
          req.body.stock
        )
        Promise.all(
          req.body.stockDetails.map(async (stockDetail, i) => {
            if (stockDetail._id) {
              const stockDetails = await StockDetails.findByIdAndUpdate(
                { _id: stockDetail._id },
                stockDetail
            )
            if(stockDetail.history) await historyController.addHistory(stockDetail.history,payload,'stock','updateStockDetail',req.body.stockDetails.length - i)
            } else {
              stockDetail['stock'] = stock._id
              const newStockDetail = new StockDetails(stockDetail)
              // newStockDetail['_id'] = mongoose.Schema.ObjectId;
              const stockDetails = await newStockDetail.save()
              let record = await historyController.addHistory(
                stockDetail.history,
                payload,
                'stock',
                'updateStockDetail',
                req.body.stockDetails.length - i
              )
            }
          })
        ).then(async () => {
          let record = await historyController.addHistory(
            stockHistory,
            payload,
            'stock',
            'update',
            0
          )
          res.status(200).send({ msg: 'updated' })
        })
      } catch (err) {
        res.status(500).send(err.message)
      }
    }
  })
}

module.exports.addStockDetailsWithStock = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      req.body.stock['_id'] = new mongoose.Types.ObjectId()
      let stockHistory = req.body.stock.history;

      delete req.body.stock['history']
      const stock = new Stock(req.body.stock)
      stock.save().then(async result => {
        if (!result) {
          return error
        } else {
          let add = await req.body.stockDetails.map((x, i) => {
            historyController.addHistory(
              x.history,
              payload,
              'stock',
              'addStockDetail',
              req.body.stockDetails.length - i
            )
            req.body.stockDetails[i]['stock'] = stock._id
            req.body.stockDetails[i]['soldQty'] = 0
          })
          StockDetails.insertMany(req.body.stockDetails)
            .then(data => {
              historyController.addHistory(
                stockHistory,
                payload,
                'stock',
                'add',
                0
              )
              res.status(200).send(data)
            })
            .catch(error => {
              res.status(500).send({ msg: 'internal server error', err: err })
            })
        }
      })
    }
  })
}

module.exports.getStockSecondReport = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let result = await StockDetails.find({}, { actualQty: 1 }).populate(
          'itemId',
          'name'
        )
        let arr = []
        Promise.all(
          result.map(obj => {
            let filter = result.filter(object => {
              return object.itemId._id == obj.itemId._id
            })
            if (filter.length) {
              let sum = filter.reduce((ac, cu) => {
                return cu.itemId._id == obj.itemId._id ? ac + cu.actualQty : ac
              }, 0)
              obj.actualQty = sum
              arr.push(obj)
            }
            result = result.filter(object => {
              return object.itemId._id != obj.itemId._id
            })
          })
        ).then(() => {
          if (arr.length) {
            res.status(200).send(arr)
          } else {
            res.status(404).send({ msg: 'No Data Found' })
          }
        })
      } catch (err) {
        res.status(500).send({ msg: 'internal server error', err: err })
      }
    }
  })
}

module.exports.getStockSummary = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      StockDetails.find({}, { date: 1, actualQty: 1 })
        .populate('itemId', 'name')
        .populate('brandId', 'brandName')
        .then(async result => {
          let arr = []
          Promise.all(
            result.map(obj => {
              let filter = result.filter(object => {
                return object.brandId._id == obj.brandId._id
              })
              if (filter.length) {
                let sum = filter.reduce((ac, cu) => {
                  return cu.brandId._id == obj.brandId._id
                    ? ac + cu.actualQty
                    : ac
                }, 0)
                obj.actualQty = sum
                arr.push(obj)
              }
              result = result.filter(object => {
                return object.brandId._id != obj.brandId._id
              })
            })
          ).then(() => {
            if (arr.length) {
              res.status(200).send(arr)
            } else {
              res.status(404).send({ msg: 'No Data Found' })
            }
          })
        })
        .catch(error => {
          res.status(500).send(error)
        })
    }
  })
}

module.exports.getDamageStock = (req, res) => {
  // jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
  //   err,
  //   payload
  // ) {
  //   if (err) {
  //     res.send(401).send({ message: 'not authentic user' })
  //   } else {
      StockDetails.find({}, { date: 1, damageQty: 1, modelNumber:1, color:1, size:1 })
        .populate('itemId', 'name')
        .populate('brandId', 'brandName').lean()
        .then(async result => {
          let sendObj = result;
          let arr = [];
          Promise.all(
            result.map((obj, i) => {
              result[i]['brandName'] = obj.brandId.brandName
              result[i]['brandId'] = obj.brandId._id
              result[i]['itemName'] = obj.itemId.name
              result[i]['itemId'] = obj.itemId._id
              }),
            result.map(obj => {
               arr = result.filter(object => {
                return object.brandId == obj.brandId
              })
            })
          ).then(() => {
              res.status(200).send(arr);
          })
        })
        .catch(error => {
          res.status(500).send(error)
        })
    }
//   })
// }

module.exports.getItemsInStockDetails = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      StockDetails.find({}, { initialQty: 1 })
        .populate('itemId', 'name')
        .exec()
        .then(result => {
          if (result.length) {
            let finalResult = result.reduce((unique, o) => {
              if (!unique.some(obj => obj.itemId._id == o.itemId._id)) {
                unique.push(o)
              }
              return unique
            }, [])
            res.status(200).send(finalResult)
          } else {
            res.status(404).send({ msg: 'No Data Found' })
          }
        })
        .catch(error => {
          res.status(500).send(error)
        })
    }
  })
}

module.exports.getBrandsOfItemsInStockDetails = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      StockDetails.find({ itemId: req.params.itemId }, { modelNumber: 1 })
        .populate('brandId', 'brandName')
        .exec()
        .then(result => {
          if (result.length) {
            let finalResult = result.reduce((unique, o) => {
              if (!unique.some(obj => obj.brandId._id == o.brandId._id)) {
                unique.push(o)
              }
              return unique
            }, [])
            res.status(200).send(finalResult)
          } else {
            res.status(404).send({ msg: 'No Data Found' })
          }
        })
        .catch(error => {
          res.status(500).send(error)
        })
    }
  })
}

module.exports.getModelsOfItemsAndBrands = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      StockDetails.find(
        { itemId: req.body.itemId, brandId: req.body.brandId },
        { modelNumber: 1 }
      )
        .exec()
        .then(result => {
          if (result.length) {
            let finalResult = result.reduce((unique, o) => {
              if (!unique.some(obj => obj.modelNumber == o.modelNumber)) {
                unique.push(o)
              }
              return unique
            }, [])
            res.status(200).send(finalResult)
          } else {
            res.status(404).send({ msg: 'No Data Found' })
          }
        })
        .catch(error => {
          res.status(500).send(error)
        })
    }
  })
}

module.exports.getColorsOfModelsItemsAndBrands = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      StockDetails.find(
        {
          itemId: req.body.itemId,
          brandId: req.body.brandId,
          modelNumber: req.body.modelNumber
        },
        { color: 1 }
      )
        .exec()
        .then(result => {
          if (result.length) {
            let finalResult = result.reduce((unique, o) => {
              if (!unique.some(obj => obj.color == o.color)) {
                unique.push(o)
              }
              return unique
            }, [])
            res.status(200).send(finalResult)
          } else {
            res.status(404).send({ msg: 'No Data Found' })
          }
        })
        .catch(error => {
          res.status(500).send(error)
        })
    }
  })
}

module.exports.getStockOfColorModelItemAndBrand = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{
          let result = await StockDetails.find({itemId: req.body.itemId,brandId: req.body.brandId, modelNumber: req.body.modelNumber,color: req.body.color},{ actualQty: 1, totalCost: 1, initialQty: 1, unitCost:1,date:1 }).sort('date').exec();
          
          let calculate = result
            .reduce((ac, cu) => {
              ac.actualQty += cu.actualQty
              ac.initialQty += cu.initialQty
              ac.totalCost += cu.actualQty  ? cu.totalCost : 0
              return ac
            })
            .toObject()
            let final = {
            'stock': calculate.actualQty,
            'price' : Math.round( calculate.totalCost / calculate.initialQty).toFixed(2)
          }

          return res.status(200).send(final);

      }catch(err){
        return res.status(500).send(err);
      }
    }
  })
}
