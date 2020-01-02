const Invoice = require('../models/invoice.model')
const InvoiceDetails = require('../models/invoice-details.model')
const Customer = require('../models/customer.model')
const errorHandler = require('../utils/errorHandler')
const getInvoiceNumber = require('../utils/invoiceNumberGenerator')
const sixDigits = require('../utils/sixDigits')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

module.exports.getInvoice = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{

        let invoices = await Invoice.find({ status: true }).populate('customerId', 'companyName').lean().exec();

        if(!invoices && !invoices.length) return res.status(404).send({ message: 'No Data Found' });

        Promise.all(
          invoices.map((invoice,i) =>{
              invoices[i]['companyName'] = invoice.customerId.companyName;
              invoices[i]['customerId'] = invoice.customerId._id;
          })
        ).then(data =>{
           return res.status(200).send(invoices);
        })        

      }catch(err){
        return res.status(500).send(err)
      }
    }
  })
}

module.exports.getSummeryDetails = async (req,res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      let detailQuery = {};
      let invoiceQuery = {};
      let matchQuery = {}
      
      req.body.itemId ? (detailQuery['itemId'] = req.body.itemId ) : "";
      req.body.brandId ? (detailQuery['brandId'] = req.body.brandId ) : "";
      req.body.modelNumber ? (detailQuery['modelNumber'] = req.body.modelNumber ) : "";
      req.body.color ? (detailQuery['color'] = req.body.color ) : "";
      
      req.body.fromDate ? (invoiceQuery['date'] = {$gte:new Date(req.body.fromDate)}) : "";
      req.body.toDate ? (invoiceQuery['date'] = {$gte:new Date(req.body.toDate)}) : "";
      req.body.fromDate && req.body.toDate ? (invoiceQuery['date'] = {$gte:new Date(req.body.fromDate),$lte:new Date(req.body.toDate)} ) : "";
      req.body.customerId ? (invoiceQuery['customerId'] = req.body.customerId ) : "";
      req.body.invoiceNo ? (invoiceQuery['invoiceNo'] = req.body.invoiceNo ) : "";

      let invoices = await Invoice.find().count();
      InvoiceDetails.find(detailQuery)
        .populate({
          path:'invoiceId',
          match:invoiceQuery
        }).lean()
        .then(details => {
          // console.log("details ->",details);
          let filterArray = details.filter(obj =>{return obj.invoiceId !== null});
          let obj = {
            invoices:invoices,
            cost: filterArray.reduce((acc, current) => {
              return acc + current.avgCost
            }, 0),
            totalPieces: filterArray.reduce((acc, current) => {
              return acc + current.pieceQty
            }, 0),
            sale: filterArray.reduce((acc, current) => {
              return acc + current.totalCost
            }, 0),
            netDiscount: filterArray.reduce((acc, current) => {
              return acc + (current.totalCost - current.afterDiscount)
            }, 0),
            netSale:
            filterArray.reduce((acc, current) => {
                return acc + current.totalCost
              }, 0) -
              filterArray.reduce((acc, current) => {
                return acc + (current.totalCost - current.afterDiscount)
              }, 0),
            profitLoss:filterArray.reduce((acc,current) =>{
              return acc + (current.afterDiscount - (current.avgCost * current.pieceQty))
            }, 0)
          }
          res.status(200).send(obj)
        }).catch(err =>{
          res.status(500).send(err);
        })
      }
    })
}

module.exports.getInvoicesSummery = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      let invoices = await Invoice.find().count();
      InvoiceDetails.find()
        .populate('invoiceId')
        .then(details => {
          let obj = {
            invoices:invoices,
            cost: details.reduce((acc, current) => {
              return acc + current.avgCost
            }, 0),
            totalPieces: details.reduce((acc, current) => {
              return acc + current.pieceQty
            }, 0),
            sale: details.reduce((acc, current) => {
              return acc + current.totalCost
            }, 0),
            netDiscount: details.reduce((acc, current) => {
              return acc + (current.totalCost - current.afterDiscount)
            }, 0),
            netSale:
              details.reduce((acc, current) => {
                return acc + current.totalCost
              }, 0) -
              details.reduce((acc, current) => {
                return acc + (current.totalCost - current.afterDiscount)
              }, 0),
            profitLoss:details.reduce((acc,current) =>{
              return acc + (current.afterDiscount - (current.avgCost * current.pieceQty))
            }, 0)
          }
          res.status(200).send(obj)
        })
    }
  })
}

module.exports.getInvoiceId = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.count()
        .then(length => {
          let id = sixDigits((length + 1).toString())
          res.status(200).send({ invoiceId: id })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getInvoiceById = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.findById({ _id: req.params.id, status: true })
        .then(invoice => {
          res.status(200).send(invoice)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getInvoiceWithInvoiceDetails = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let invoice = await Invoice.findOne({ _id: req.params.id })
        let invoiceDetails = await InvoiceDetails.find({
          invoiceId: req.params.id
        })
          .populate('itemId', 'name')
          .populate('brandId', 'brandName')

        let obj = { invoice, invoiceDetails }
        res.status(200).send(obj)
      } catch (err) {
        res.status(500).send(errorHandler(err))
      }
    }
  })
}

module.exports.setInvoice = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.create(req.body)
        .then(invoice => {
          res.status(200).send(invoice)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.editInvoice = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body)
        .then(() => {
          Invoice.findById({ _id: req.body._id })
            .then(invoice => {
              res.status(200).send(invoice)
            })
            .catch(err => {
              res.status(500).json(errorHandler(err))
            })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.deleteInvoice = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.findByIdAndUpdate(
        { _id: req.params.id, status: true },
        { $set: { status: false } }
      )
        .then(() => {
          Invoice.findById({ _id: req.params.id })
            .then(invoice => {
              res.status(200).send(invoice)
            })
            .catch(err => {
              res.status(500).json(errorHandler(err))
            })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getCustomers = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Customer.find({}, { _id: 1, clientName: 1 })
        .then(customers => {
          res.status(200).send(customers)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}
