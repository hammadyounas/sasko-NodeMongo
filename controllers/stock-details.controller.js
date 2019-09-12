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
      .populate('itemId')
      .populate('brandId')
    res.status(200).send(stockDetails)
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
        console.log('stock ->', stock)
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
      const newStock = await Stock.findOne({ _id: req.body.stock._id })
      Promise.all(
        req.body.stockDetails.map(async stock => {
          const newStockDetails = await StockDetails.findOne({ _id: stock._id })
          updatedArray.push(newStockDetails)
        })
      ).then(() => {
        res.status(200).send({ ...newStock._doc, updatedArray })
      })
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
      StockDetails.insertMany(req.body.stockDetails)
        .then(data => {
          console.log(data)
          res.status(200).send(data)
        })
        .catch(error => console.log(error))
    }
  })
}

module.exports.addStockDetailsWithOutStock = async (req, res) => {
  let stock = await Stock.findOne({ stockId: req.body.stockDetails[0].itemId })
  req.body.stockDetails.map(x => (x['stock'] = stock._id))
  StockDetails.insertMany(req.body.stockDetails, (error, docs) => {
    if (error) res.send(500).json(errorHandler(error))

    res.send((200).json({ data: docs }))
  })
}

module.exports.getStockSecondReport = async (req, res) => {
  try {
    let report = await StockDetails.find({}, { itemId: 1, actualQty: 1 })
    console.log('report =>', report)

    if (!report.length) {
      res.status(404).send({ msg: 'No data found' })
    } else {
      let myArray = []
      let myPromise
      report.map(obj => {
        myPromise = Item.findOne({ _id: obj['itemId'] }).then(res => {
          myArray.push({ itemName: res.name, actualQty: obj['actualQty'] })
        })
      })

      Promise.all([myPromise]).then(() => {
        res.status(200).send(myArray)
      })
    }
  } catch (err) {
    res.status(500).send({ msg: 'internal server error' })
  }
}

module.exports.getStockSummary = async (req, res) => {
  StockDetails.find({}, { date: 1, initialQty: 1 })
    .populate('itemId', 'name')
    .populate('brandId', 'brandName')
    .then(async result => {
      let arr = result.reduce((acculator,current)=>{
        return 
      })
      res.status(200).send(result);
    })
    .catch(error => {
      res.status(500).send(error);
    })
}

module.exports.getDamageStock = async (req, res) => {
  try {
    let damageStock = await StockDetails.find(
      {},
      { brandId: 1, damageQty: 1, date: 1 }
    )
    if (!damageStock.length) {
      res.status(404).send({ msg: 'No data found' })
    } else {
      let arr = []
      Promise.all(
        damageStock.map(async stock => {
          let brand = await Brands.findOne({ _id: stock.brandId })
          let brandName = brand.brandName
          const temp = { ...stock._doc, brandName }
          arr.push(temp)
        })
      ).then(result => {
        res.status(200).send(arr)
      })
    }
  } catch (err) {
    res.status(500).send({ msg: 'Internal Server Error' })
  }
}

module.exports.getItemsInStockDetails = (req, res) => {
  StockDetails.find({}, { initialQty: 1 })
    .populate('itemId', 'name')
    .exec()
    .then(result => {
      res.status(200).send(result)
    })
    .catch(error => {
      res.status(500).send(error)
    })
}

module.exports.getBrandsOfItemsInStockDetails = (req, res) => {
  StockDetails.find({ itemId: req.body.itemId }, { modelNumber: 1 })
    .populate('brandId', 'brandName')
    .exec()
    .then(result => {
      res.status(200).send(result)
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
      res.status(200).send(result)
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
