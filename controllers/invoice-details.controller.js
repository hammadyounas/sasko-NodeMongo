const mongoose = require('mongoose')
const Invoice = require('../models/invoice.model')
const InvoiceDetails = require('../models/invoice-details.model')
const errorHandler = require('../utils/errorHandler')
const StockDetails = require('../models/stock-details.model')
const LedgerReport = require('../models/ledger-report.model')
const Customer = require('../models/customer.model')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

module.exports.getInvoiceDetails = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      InvoiceDetails.find({ status: true })
        .then(invoiceDetails => {
          res.status(200).send(invoiceDetails)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getInvoiceDetailWithInvoice = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      InvoiceDetails.findOne({ status: true, _id: req.params.id })
        .populate('brandId', 'brandName')
        .populate('itemId', 'name')
        .populate({
          path: 'invoiceId',
          populate: { path: 'customerId', select: 'clientName' }
        })
        .lean()
        .then(result => {
          if (result) {
            let obj = { invoice: result.invoiceId }
            obj.invoice['customerName'] = obj.invoice.customerId.clientName
            delete obj.invoice['customerId']
            result['brandName'] = result.brandId.brandName
            result.brandId = result.brandId._id
            result['itemName'] = result.itemId.name
            result.itemId = result.itemId._id
            delete result['invoiceId']
            obj['invoiceDetail'] = result
            res.status(200).send(obj)
          } else {
            res.status(404).send({ msg: 'data not found' })
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.addInvoiceDetailsWithInvoice = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let invoiceDetailsArray, invoiceVar
       
        req.body.invoice['_id'] = new mongoose.Types.ObjectId()
        let invoiceHistory = req.body.invoice.history; 
        delete req.body.invoice['history'];
        const invoice = new Invoice(req.body.invoice)
        invoice.save().then(async result => {
          if (!result) {
            return error
          } else {
            invoiceVar = result
            let ledgerReport = await addLedgerReport(result)
            req.body.invoiceDetails.map((x,i) => {
                historyController.addHistory(
                  x.history,
                  payload,
                  'invoice',
                  'addInvoiceDetail',
                  req.body.invoiceDetails.length - i
                )
                x['invoiceId'] = invoice._id;
            })
            Promise.all(
              req.body.invoiceDetails.map(async detail => {
                let stockDetails = await StockDetails.find(
                  {
                    itemId: detail.itemId,
                    brandId: detail.brandId,
                    modelNumber: detail.modelNumber,
                    color: detail.color
                  },
                  { actualQty: 1, soldQty: 1, date: 1 }
                )
                stockDetails.sort(function (a, b) {
                  return new Date(a.date) - new Date(b.date)
                })
                let pieceQty = detail.pieceQty
                Promise.all(
                  stockDetails.map(async (obj, index) => {
                    if (pieceQty != 0 && obj.actualQty > 0) {
                      if (obj.actualQty < pieceQty) {
                        pieceQty -= obj.actualQty
                        obj.soldQty += obj.actualQty
                        obj.actualQty = 0
                      } else if (obj.actualQty > pieceQty) {
                        obj.actualQty -= pieceQty
                        obj.soldQty += pieceQty
                        pieceQty = 0
                      } else if (obj.actualQty == pieceQty) {
                        obj.actualQty = 0
                        obj.soldQty += pieceQty
                        pieceQty = 0
                      }
                      stockDetails[index] = obj
                      let update = await StockDetails.updateOne(
                        { _id: obj.id },
                        {
                          $set: {
                            actualQty: obj.actualQty,
                            soldQty: obj.soldQty
                          }
                        }
                      )
                    }
                  })
                )
              })
            ).then(() => {
              const promise = InvoiceDetails.insertMany(req.body.invoiceDetails)
                .then(data => {
                  historyController.addHistory(
                    invoiceHistory,
                    payload,
                    'invoice',
                    'add',
                    0
                  )
                  invoiceDetailsArray = data
                })
                .catch(err => {
                  res.status(500).json(errorHandler(err))
                })
              Promise.all([promise])
                .then(() => {
                  res.status(200).send({
                    invoice: invoiceVar,
                    invoiceDetails: invoiceDetailsArray
                  })
                })
                .catch(err => {
                  res.status(500).json(errorHandler(err))
                })
            })
          }
        })
      } catch (err) {
        res.status(500).json(errorHandler(err))
      }
    }
  })
}

async function addLedgerReport (invoiceDetail) {
  console.log(invoiceDetail.customerId)
  let ledger = await LedgerReport.find({ customerId: invoiceDetail.customerId })
    .sort({ createdAt: -1 })
    .limit(1)
  // .then(ledger => {
  console.log('ledger', ledger)
  let newObj = {
    balance: 0,
    credit: invoiceDetail.totalNetCost,
    date: invoiceDetail.date,
    description: '',
    customerId: invoiceDetail.customerId,
    invoiceId: invoiceDetail._id
  }
  if (!ledger.length) {
    newObj['balance'] = invoiceDetail.totalNetCost
  } else {
    newObj['balance'] = invoiceDetail.totalNetCost + ledger[0].balance
  }
  let updated = await LedgerReport.create(newObj)
  return updated
}

module.exports.editInvoiceDetailsWithInvoice = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        if (req.body.posted) {
          res.status(404).send({ msg: 'can not edit this invoice detail' })
        } else {
          const invoice = await Invoice.findByIdAndUpdate(
            { _id: req.body.invoice._id },
            req.body.invoice
          )
          Promise.all(
            req.body.invoiceDetails.map(async invoiceDetail => {
              let stockDetails = await StockDetails.find(
                {
                  itemId: invoiceDetail.itemId,
                  brandId: invoiceDetail.brandId,
                  modelNumber: invoiceDetail.modelNumber,
                  color: invoiceDetail.color
                },
                { actualQty: 1, soldQty: 1, date: 1 }
              )
              if (invoiceDetail._id) {
                let oldInvoiceDetail = await InvoiceDetails.findOne({
                  _id: invoiceDetail._id
                })
                if (
                  invoiceDetail.itemId != oldInvoiceDetail.itemId ||
                  invoiceDetail.brandId != oldInvoiceDetail.brandId ||
                  invoiceDetail.modelNumber != oldInvoiceDetail.modelNumber ||
                  invoiceDetail.color != oldInvoiceDetail.color
                ) {
                  let pieceQty = oldInvoiceDetail.pieceQty
                  let oldStockDetails = await StockDetails.find(
                    {
                      itemId: oldInvoiceDetail.itemId,
                      brandId: oldInvoiceDetail.brandId,
                      modelNumber: oldInvoiceDetail.modelNumber,
                      color: oldInvoiceDetail.color
                    },
                    { actualQty: 1, soldQty: 1, date: 1 }
                  )
                  let updateStockDetails = await decreaseSoldQtyStockDetails(
                    oldStockDetails,
                    pieceQty
                  )
                }
                if (oldInvoiceDetail.pieceQty > invoiceDetail.pieceQty) {
                  let pieceQty =
                    oldInvoiceDetail.pieceQty - invoiceDetail.pieceQty
                  let updateStockDetails = await decreaseSoldQtyStockDetails(
                    stockDetails,
                    pieceQty
                  )
                } else if (
                  oldInvoiceDetail.pieceQty <= invoiceDetail.pieceQty
                ) {
                  let pieceQty =
                    invoiceDetail.pieceQty - oldInvoiceDetail.pieceQty
                  let updateStockDetails = await increaseSoldQtyStockDetails(
                    stockDetails,
                    pieceQty
                  )
                }
                let updateInvoiceDetail = await InvoiceDetails.findOneAndUpdate(
                  { _id: invoiceDetail._id },
                  invoiceDetail
                )
                // let upadatePieceQty = invoiceDetail.pieceQty - oldInvoiceDetail.pieceQty
              } else {
                let pieceQty = invoiceDetail.pieceQty
                let updateStockDetails = await increaseSoldQtyStockDetails(
                  stockDetails,
                  pieceQty
                )
                invoiceDetail['invoiceId'] = invoice._id
                const newInvoiceDetail = new InvoiceDetails(invoiceDetail)
                const newAddedInvoiceDetail = await newInvoiceDetail.save()
              }
            })
          ).then(() => {
            res.status(200).send({ msg: 'invoice updated' })
          })
        }
      } catch (err) {
        res.status(500).send(err.message)
      }
    }
  })
}

async function decreaseSoldQtyStockDetails (stockDetails, pieceQty) {
  stockDetails
    .sort(function (a, b) {
      return new Date(a.date) - new Date(b.date)
    })
    .reverse()
  Promise.all(
    stockDetails.map(async (obj, index) => {
      if (pieceQty != 0 && obj.soldQty > 0) {
        if (obj.soldQty < pieceQty) {
          obj.actualQty += obj.soldQty
          pieceQty -= obj.soldQty
          obj.soldQty = 0
        } else if (obj.soldQty > pieceQty) {
          obj.actualQty += pieceQty
          obj.soldQty -= pieceQty
          pieceQty = 0
        } else if (obj.actualQty == pieceQty) {
          obj.soldQty = 0
          obj.actualQty += pieceQty
          pieceQty = 0
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

async function increaseSoldQtyStockDetails (stockDetails, pieceQty) {
  stockDetails.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date)
  })
  Promise.all(
    stockDetails.map(async (obj, index) => {
      if (pieceQty != 0 && obj.actualQty > 0) {
        if (obj.actualQty < pieceQty) {
          pieceQty -= obj.actualQty
          obj.soldQty += obj.actualQty
          obj.actualQty = 0
        } else if (obj.actualQty > pieceQty) {
          obj.actualQty -= pieceQty
          obj.soldQty += pieceQty
          pieceQty = 0
        } else if (obj.actualQty == pieceQty) {
          obj.actualQty = 0
          obj.soldQty += pieceQty
          pieceQty = 0
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

module.exports.deleteInvoiceDetails = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      InvoiceDetails.findByIdAndUpdate(
        { _id: req.params.id, status: true },
        { $set: { status: false } }
      )
        .then(() => {
          InvoiceDetails.findById({ _id: req.params.id })
            .then(invoiceDetails => {
              res.status(200).send(invoiceDetails)
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

module.exports.modelColorWiseSale = async (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      InvoiceDetails.find(
        { status: true },
        { modelNumber: 1, color: 1, rate: 1, totalCost: 1 }
      )
        .populate('itemId', 'name')
        .populate('brandId', 'brandName')
        .populate({
          path: 'invoiceId',
          select: 'invoiceNo totalQty date',
          populate: { path: 'customerId', select: 'clientName' }
        })
        .lean()
        .then(invoiceDetails => {
          if (!invoiceDetails.length) {
            res.status(404).send({ msg: 'data not found' })
          } else {
            Promise.all(
              invoiceDetails.map((invoiceDetail, i) => {
                invoiceDetails[i]['itemName'] = invoiceDetail.itemId.name
                invoiceDetails[i]['brandName'] = invoiceDetail.brandId.brandName
                invoiceDetails[i]['invoiceNo'] =
                  invoiceDetail.invoiceId.invoiceNo
                invoiceDetails[i]['totalQty'] = invoiceDetail.invoiceId.totalQty
                invoiceDetails[i]['date'] = invoiceDetail.invoiceId.date
                invoiceDetails[i]['brandName'] = invoiceDetail.brandId.brandName
                invoiceDetails[i]['customerName'] =
                  invoiceDetail.invoiceId.customerId.clientName
                delete invoiceDetails[i]['itemId']
                delete invoiceDetails[i]['brandId']
                delete invoiceDetails[i].invoiceId
              })
            ).then(() => {
              res.status(200).send(invoiceDetails)
            })
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}
