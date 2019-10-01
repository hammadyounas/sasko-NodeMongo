const mongoose = require('mongoose')
const StockDetails = require('../models/stock-details.model')
const Stock = require('../models/stock.model')
const Item = require('../models/item.model')
const Brands = require('../models/brand.model')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getStockDetails = async (req, res) => {
  try {
    let stockDetails = await StockDetails.find()
      .populate('itemId', 'name')
      .populate('brandId', 'brandName')
      .populate('stock','stockId')
    if (stockDetails.length) {
      res.status(200).send(stockDetails)
    } else {
      res.status(404).send({ msg: 'No Data Found' })
    }
  } catch (err) {
    res.status(500).send({ msg: 'Internal Server Error' })
  }
}

module.exports.deleteStockDetails = (req, res) => {
  StockDetails.findOneAndRemove({ _id: req.params.id })
    .then(StockDetails => {
      res.send(StockDetails)
    })
    .catch(error => {
      res.send(error)
    })
}

module.exports.editStockDetails = async (req, res) => {
  try {
    let updatedArray = []
    const stock = await Stock.findByIdAndUpdate(
      { _id: req.body.stock._id },
      req.body.stock
    )
    Promise.all(
      req.body.stockDetails.map(async stockDetail => {
        if (stockDetail._id) {
          const stockDetails = await StockDetails.findByIdAndUpdate(
            { _id: stockDetail._id },
            stockDetail
          )
        } else {
          stockDetail['stock'] = stock._id
          const newStockDetail = new StockDetails(stockDetail)
          const stockDetails = await newStockDetail.save()
        }
      })
    ).then(async () => {
      res.status(200).send({ msg: 'updated' });
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

module.exports.addStockDetailsWithStock = (req, res) => {
  req.body.stock['_id'] = new mongoose.Types.ObjectId()
  const stock = new Stock(req.body.stock)
  stock.save().then(result => {
    if (!result) {
      return error
    } else {
      req.body.stockDetails.map(x => (x['stock'] = stock._id))
      req.body.stockDetails.map((x, i) => {
        req.body.stockDetails['stock'] = stock._id
        req.body.stockDetails['soldQty'] = 0
      })
      StockDetails.insertMany(req.body.stockDetails)
        .then(data => {
          res.status(200).send(data)
        })
        .catch(error => {
          res.status(500).send({ msg: 'internal server error', err: err })

        })
    }
  })
}

module.exports.getStockSecondReport = async (req, res) => {
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

module.exports.getStockSummary = async (req, res) => {
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
              return cu.brandId._id == obj.brandId._id ? ac + cu.actualQty : ac
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

module.exports.getDamageStock = async (req, res) => {
  StockDetails.find({}, { date: 1, damageQty: 1 })
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
              return cu.brandId._id == obj.brandId._id ? ac + cu.damageQty : ac
            }, 0)
            obj.damageQty = sum
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

module.exports.getItemsInStockDetails = (req, res) => {
  StockDetails.find({}, { initialQty: 1 })
    .populate('itemId', 'name')
    .exec()
    .then(result => {
      if (result.length) {
        let finalResult = result.reduce((unique, o) => {
          if(!unique.some(obj => obj.itemId._id == o.itemId._id)) {
            unique.push(o);
          }
          return unique;
      },[]);
        res.status(200).send(finalResult)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
    })
    .catch(error => {
      res.status(500).send(error)
    })
}

module.exports.getBrandsOfItemsInStockDetails = (req, res) => {
  StockDetails.find({ itemId: req.params.itemId }, { modelNumber: 1 })
    .populate('brandId', 'brandName')
    .exec()
    .then(result => {
      if (result.length) {
        let finalResult = result.reduce((unique, o) => {
          if(!unique.some(obj => obj.brandId._id == o.brandId._id)) {
            unique.push(o);
          }
          return unique;
      },[]);
        res.status(200).send(finalResult)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
    })
    .catch(error => {
      res.status(500).send(error)
    })
}

module.exports.getModelsOfItemsAndBrands = (req, res) => {
  StockDetails.find(
    { itemId: req.body.itemId, brandId: req.body.brandId },
    { modelNumber: 1 }
  )
    .exec()
    .then(result => {
      if (result.length) {
        let finalResult = result.reduce((unique, o) => {
          if(!unique.some(obj => obj.modelNumber == o.modelNumber)) {
            unique.push(o);
          }
          return unique;
      },[]);
        res.status(200).send(finalResult)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
    })
    .catch(error => {
      res.status(500).send(error)
    })
}

module.exports.getColorsOfModelsItemsAndBrands = (req, res) => {
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
          if(!unique.some(obj => obj.color == o.color)) {
            unique.push(o);
          }
          return unique;
      },[]);
        res.status(200).send(finalResult)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
    })
    .catch(error => {
      res.status(500).send(error)
    })
}

module.exports.getStockOfColorModelItemAndBrand = (req, res) => {
  StockDetails.find({
    itemId: req.body.itemId,
    brandId: req.body.brandId,
    modelNumber: req.body.modelNumber,
    color: req.body.color
  },{actualQty:1,totalCost:1,initialQty:1})
    .exec()
    .then(result => {
      let final = result.reduce((ac,cu)=>{
        ac.actualQty += cu.actualQty
        ac.initialQty += cu.initialQty
        ac.totalCost += cu.totalCost
       return ac  
       }).toObject()
       final['stock'] = final.actualQty;
       final['avgCost'] = final.totalCost/final.initialQty;

      res.status(200).send(final)
    })
    .catch(error => {
      res.status(500).send(error)
    })
}
