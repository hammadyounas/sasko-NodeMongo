const mongoose = require('mongoose')
const StockDetails = require('../models/stock-details.model')
const Stock = require('../models/stock.model')
const Item = require('../models/item.model')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getStockDetails = (req, res) => {
  StockDetails.find()
    .then(StockDetails => {
      res.send(StockDetails)
    })
    .catch(error => {
      res.send(error)
    })
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

module.exports.editStockDetails = (req, res) => {
  StockDetails.findByIdAndUpdate({ _id: req.params.id }, req.body, {
    new: true
  }).exec((error, doc) => {
    if (error) res.send(error)

    res.send(doc)
  })
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
    console.log("report =>", report);

    if (!report.length) {
      res.status(404).send({ msg: 'No data found' })
    } else {
      let myArray = [];
      let myPromise;
      report.map(obj => {
        myPromise = Item.findOne({ _id: obj['itemId'] }).then(res => {
          myArray.push({ itemName: res.name, actualQty: obj['actualQty'] });
        })
      });

      Promise.all([myPromise]).then(() => {
        res.status(200).send(myArray);
      });
    }
  } catch (err) {
    res.status(500).send({ msg: 'internal server error' })
  }
}

module.exports.getStockSummary = async (req, res) => {
  try {
    let stockSummery = await StockDetails.find(
      {},
      { itemName: 1, brandName: 1, date: 1 }
    )
    if (!stockSummery.length) {
      res.status(404).send({ msg: 'No data found' })
    } else {
      res.status(200).send(stockSummery);
    }
  } catch (err) {
    res.status(500).send({ msg: 'internal server error' })
  }
}

module.exports.getDamageStock = async (req, res) => {
  try {
    let damageStock = await StockDetails.find({}, { brandName: 1, damageQty: 1, date: 1 });
    if (!damageStock.length) {
      res.status(404).send({ msg: 'No data found' })
    } else {
      res.status(200).send(damageStock);
    }
  } catch (err) {
    res.status(500).send({ msg: 'Internal Server Error' });
  }
}
