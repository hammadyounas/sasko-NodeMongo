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
    let arr = []
    Promise.all(
      stockDetails.map(async detail => {
        let item = await Item.findOne({ _id: detail.itemId })
        let brand = await Brands.findOne({ _id: detail.brandId })
        let itemName = item.name
        let brandName = brand.brandName
        const temp = { ...detail._doc, itemName, brandName }
        arr.push(temp)
      })
    ).then(result => {
      res.status(200).send(arr)
    })
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
    let updatedArray = [];
    const stock = await Stock.findByIdAndUpdate({ _id: req.body.stock._id }, req.body.stock);
    Promise.all(
      req.body.stockDetails.map(async stock => {
        const stockDetails = await StockDetails.findByIdAndUpdate({ _id: stock._id }, stock);
      })).then(async () => {
        const newStock = await Stock.findOne({ _id: req.body.stock._id });
        Promise.all(
          req.body.stockDetails.map(async stock => {
            const newStockDetails = await StockDetails.findOne({ _id: stock._id });
            updatedArray.push(newStockDetails);
          })
        ).then(() => {
          res.status(200).send({ ...newStock._doc, updatedArray });
        });
      });
  } catch (err) {
    res.status(500).send({ msg: 'Internal Server Error' });
  }
};

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
  try {
    let stockSummary = await StockDetails.find(
      {},
      { itemId: 1, brandId: 1, date: 1 }
    )
    if (!stockSummary.length) {
      res.status(404).send({ msg: 'No data found' })
    } else {
      let arr = []
      Promise.all(
        stockSummary.map(async stock => {
          let item = await Item.findOne({ _id: stock.itemId })
          let brand = await Brands.findOne({ _id: stock.brandId })
          let itemName = item.name
          let brandName = brand.brandName
          const temp = { ...stock._doc, itemName, brandName }
          arr.push(temp)
        })
      ).then(result => {
        res.status(200).send(arr)
      })
    }
  } catch (err) {
    res.status(500).send({ msg: 'internal server error' })
  }
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
