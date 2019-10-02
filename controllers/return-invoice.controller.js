const ReturnInvoice = require('../models/return-invoice.model');
const errorHandler = require('../utils/errorHandler');
const sixDigits = require('../utils/sixDigits');
const InvoiceDetails = require('../models/invoice-details.model');
const StockDetails = require('../models/stock-details.model');
const ReturnInvoiceDetail = require('../models/return-invoice.model');

module.exports.getReturnInvoice = (req, res) => {
  ReturnInvoice.find({ status: true })
    .then(invoices => {
      if(invoices){
        res.status(200).send(invoices)
      }else{
        res.status(404).send({msg:'return invoices not found'});
      }
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.getReturnInvoiceId = (req, res) => {
  ReturnInvoice.count()
    .then(length => {
      let id = sixDigits((length + 1).toString())
      res.status(200).send({ invoiceId: id })
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.setReturnInvoice = async (req, res) => {
  try {
    let invoiceDetail = await InvoiceDetails.findOne({
      _id: req.body.invoiceDetailId
    })
    if (invoiceDetail.pieceQty < req.body.totalReturnQty) {
      res
        .status(400)
        .send({
          msg: 'return quantity can not be greater then selling quantity'
        })
    } else {
      let stockDetails = await StockDetails.find({
        itemId: req.body.itemId,
        brandId: req.body.brandId,
        modelNumber: req.body.modelNumber,
        color: req.body.color
      })
      stockDetails.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date)
      })
      let updatedStockDetails = await addDamageQty(stockDetails, req.body.damageQty);
      let updatedStockDetailsSoldQty = await decreaseSoldQtyStockDetails(stockDetails,req.body.returnQty)
      let createReturnInvoiceDetail = new ReturnInvoiceDetail(req.body);
      createReturnInvoiceDetail.save().then(result =>{
            res.status(200).send(result);
      }).catch(err => {
      res.status(500).json(errorHandler(err))
    })
    }
  } catch (err) {
    res.status(500).json(errorHandler(err))
  }
}

async function addDamageQty (stockDetails, damageQty) {
  
  Promise.all(
    stockDetails.map(async (obj, index) => {
      if (damageQty != 0 && obj.soldQty > 0) {
        if (damageQty <= obj.soldQty) {
          obj.damageQty += damageQty;
          obj.soldQty -= damageQty;
          damageQty = 0;
        }else if(damageQty > obj.soldQty){
            obj.damageQty += obj.soldQty;
            damageQty -= obj.soldQty;
            obj.soldQty = 0;
        }
      }
      stockDetails[index] = obj
        let update = await StockDetails.updateOne(
          { _id: obj.id },
          { $set: { damageQty: obj.damageQty, soldQty: obj.soldQty } }
        )

    })
  ).then(() => {
    return stockDetails
  })
}

async function decreaseSoldQtyStockDetails (stockDetails, returnQty) {
    Promise.all(
      stockDetails.map(async (obj, index) => {
        if (returnQty != 0 && obj.soldQty > 0) {
          if (obj.soldQty < returnQty) {
            obj.actualQty += obj.soldQty
            returnQty -= obj.soldQty
            obj.soldQty = 0
          } else if (obj.soldQty > returnQty) {
            obj.actualQty += returnQty
            obj.soldQty -= returnQty
            returnQty = 0
          } else if (obj.actualQty == returnQty) {
            obj.soldQty = 0
            obj.actualQty += returnQty
            returnQty = 0
          }
          stockDetails[index] = obj
          let update = await StockDetails.updateOne(
            { _id: obj.id },
            { $set: { actualQty: obj.actualQty, soldQty: obj.soldQty } }
          )
        }
      })
    ).then(() => {
      return true
    })
  }
