const mongoose = require('mongoose');
const StockDetails = require('../models/stock-details.model');
const Stock = require('../models/stock.model');

let errorHandler = (error) => {
    return {
        stack: error.stack,
        code: error.code,
        message: error.message
    }
}


module.exports.getStockDetails = (req, res) => {
   
    StockDetails.find().then(StockDetails => {
        res.send(StockDetails)
    }).catch(error => {
        res.send(error)
    })
}


module.exports.deleteStockDetails = (req, res) => {

    StockDetails.findOneAndRemove({ _id: req.params.id }).then(StockDetails => {
        res.send(StockDetails)
    }).catch(error => {
        res.send(error)
    })
}


module.exports.editStockDetails = (req, res) => {
    StockDetails.findByIdAndUpdate({ _id: req.params.id }, req.body,{new: true}).exec((error, doc) => {
        if (error)
          res.send(error);
    
        res.send(doc)
      })
}



module.exports.addStockDetailsWithStock = (req, res) => {

    req.body.stock['_id'] = new mongoose.Types.ObjectId();
    const stock = new Stock(req.body.stock);
    stock.save().then(result => {
        if (!result) {
            return error
        } else {
            req.body.stockDetails.map(x => x['stock'] = stock._id);

            StockDetails.insertMany(req.body.stockDetails).then(data => {
                console.log(data);
                res.status(200).send(data);

            }).catch(error => console.log(error));
        }
    })
}


module.exports.addStockDetailsWithOutStock = async (req, res) => {

    let stock = await Stock.findOne({ "stockId": req.body.stockDetails[0].itemId })
    req.body.stockDetails.map(x => x['stock'] = stock._id)
    StockDetails.insertMany(req.body.stockDetails, (error, docs) => {
        if (error)
            res.send(500).json(errorHandler(error))

        res.send((200).json({ data: docs }))
    })

}