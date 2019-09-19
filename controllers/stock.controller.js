const Stock = require('../models/stock.model')
const StockDetails = require('../models/stock-details.model')
const Item = require('../models/item.model')
const Brands = require('../models/brand.model')
const sixDigits = require('../utils/sixDigits')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getStock = (req, res) => {
  Stock.find()
    .then(Stock => {
      res.send(Stock)
    })
    .catch(error => {
      res.send(error)
    })
}

module.exports.getStockId = (req,res)=>{
  Stock.count().then(length =>{
    let id = sixDigits((length+1).toString())
    res.status(200).send({stockId:id});
}).catch(err => {
    res.status(500).json(errorHandler(err));
});
}

module.exports.deleteStock = (req, res) => {
  Stock.remove({ _id: req.params.id })
    .then(Stock => {
      res.send(Stock)
    })
    .catch(error => {
      res.send(error)
    })
}

module.exports.editStock = (req, res) => {
  Stock.update({ _id: req.body.id }, { name: req.body.name })
    .then(Stock => {
      res.send(Stock)
    })
    .catch(error => {
      res.send(error)
    })
}

module.exports.addStock = (req, res) => {
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

module.exports.getStockWithStockDetails = async (req, res) => {
  try {
    let stock = await Stock.findOne({ stock: req.params.id })
    let stockDetails = await StockDetails.find({ stock: req.params.id })
    let stockDetailsArray = []
    Promise.all(
      stockDetails.map(async detail => {
        let item = await Item.findOne({ _id: detail.itemId })
        let brand = await Brands.findOne({ _id: detail.brandId })
        let itemName = item.name
        let brandName = brand.brandName
        const temp = { ...detail._doc, itemName, brandName }
        stockDetailsArray.push(temp)
      })
    ).then(result => {
      const obj = { stockDetailsArray, stock }
      res.status(200).send(obj)
    })
    // res.status(200).send(obj)
  } catch (err) {
    res.status(500).send(errorHandler(err))
  }
}


