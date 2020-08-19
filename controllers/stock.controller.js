const Stock = require('../models/stock.model');
const StockDetails = require('../models/stock-details.model');
const sixDigits = require('../utils/sixDigits');
const jwt = require('jsonwebtoken');
const errorHandler = require('../utils/errorHandler')


module.exports.getStock = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let Stock = await Stock.find();

      if(!Stock) return res.status(404).send({message:'stock not found'});

      return res.status(200).send(Stock);

    }catch(err){
      return res.status(500).send(errorHandler(err));
    }
  })
}

module.exports.getStockId = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let length = await Stock.count();

      let id = sixDigits((length + 1).toString());
      
      return res.status(200).send({ stockId: id });

    }catch(err){
      return res.status(500).send(errorHandler(err));
    }
  })
}

module.exports.deleteStock = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key,async function (err, payload) {
    try{
      
      if(err) return res.send(401).send({ message: 'not authentic user' });

      let stock = await Stock.remove({ _id: req.params.id });

      if(!stock) return  res.status(404).message({message:'stock not found'});

      return res.status(200).send(stock);

    }catch(err){
      return res.status(500).send(errorHandler(err));
    }
  })
}

module.exports.editStock = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let Stock = await Stock.update({ _id: req.body.id }, { name: req.body.name });

      if(!Stock) return res.status(404).message({message:"stock update error"});

      return res.status(200).send(Stock);

    }catch(err){
      return res.status(500).send(errorHandler(err));
    }
  })
}

module.exports.addStock = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let resp = await Stock.create(req.body);

      if(!resp) return resp.status(404).send({message:"stock create error"});

      return res.status(200).send(resp);

    }catch(err){
      return res.status(500).send(errorHandler(err));
    }
  })
}

module.exports.getStockWithStockDetails = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
      try {

        if(err) return res.send(401).send({ message: 'not authentic user' });

        let stock = await Stock.findOne({ _id: req.params.id });

        let stockDetails = await StockDetails.find({stock: req.params.id}).populate('itemId', 'name').populate('brandId', 'brandName').lean();

        await Promise.all(
          stockDetails.map((stockDetail, i) => {
            stockDetails[i]['itemName'] = stockDetail.itemId.name
            stockDetails[i]['brandName'] = stockDetail.brandId.brandName
            stockDetails[i]['itemId'] = stockDetail.itemId._id
            stockDetails[i]['brandId'] = stockDetail.brandId._id
          })
        );
        
        let obj = { stock, stockDetails };
     
        return res.status(200).send(obj);
     
      } catch (err) {
        return res.status(500).json(errorHandler(err));
      }
  })
}
