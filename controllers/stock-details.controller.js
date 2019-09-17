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
    let stockDetails = await StockDetails.find({ stock: req.params.id })
      .populate('itemId', 'name')
      .populate('brandId', 'brandName')
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
      // let newStock = await Stock.findOne({ _id: req.body.stock._id })
      // Promise.all(
      //   req.body.stockDetails.map(async stock => {
      //     const newStockDetails = await StockDetails.findOne({ _id: stock._id })
      //     updatedArray.push(newStockDetails)
      //   })
      // ).then(() => {
      res.status(200).send({ msg: 'updated' })
      // })
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

module.exports.addStockDetailsWithStock = (req, res) => {
  //   console.log('check add stock', req.body)
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
          // console.log(data)
          res.status(200).send(data)
        })
        .catch(error => console.log(error))
    }
  })
}

// module.exports.addStockDetailsWithOutStock = async (req, res) => {
//   let stock = await Stock.findOne({ stockId: req.body.stockDetails[0].itemId })
//   req.body.stockDetails.map(x => (x['stock'] = stock._id))
//   StockDetails.insertMany(req.body.stockDetails, (error, docs) => {
//     if (error) res.send(500).json(errorHandler(error))

//     res.send((200).json({ data: docs }))
//   })
// }

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
          // if (sum >= 0) {
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
  StockDetails.find({}, { date: 1, initialQty: 1 })
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
              return cu.brandId._id == obj.brandId._id ? ac + cu.initialQty : ac
            }, 0)
            obj.initialQty = sum
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
            // if (sum) {
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
        res.status(200).send(result)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
      // res.status(200).send(result)
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
        res.status(200).send(result)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
      // res.status(200).send(result)
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
        res.status(200).send(result)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
      // res.status(200).send(result)
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
      res.status(200).send(result)
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
  },{initialQty:1,totalCost:1})
    .exec()
    .then(result => {
      // let final = result.reduce((ac,cu/)=>{return ac.totalCost += current.totalCost})
      let final = result.reduce((ac,cu)=>{
        ac.initialQty += cu.initialQty
        ac.totalCost += cu.totalCost
       return ac
       }).toObject()
       final['stock'] = final.initialQty;
       final['avgCost'] = final.totalCost/final.initialQty;

      res.status(200).send(final)
    })
    .catch(error => {
      res.status(500).send(error)
    })
}
