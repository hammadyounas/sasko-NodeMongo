const ReturnInvoice = require('../models/return-invoice.model')
const errorHandler = require('../utils/errorHandler')
const sixDigits = require('../utils/sixDigits')
const InvoiceDetails = require('../models/invoice-details.model')
const Invoice = require('../models/invoice.model')
const StockDetails = require('../models/stock-details.model')
const ReturnInvoiceDetail = require('../models/return-invoice.model')
const jwt = require('jsonwebtoken')
const LedgerReport = require('../models/ledger-report.model')

module.exports.getReturnInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let invoices = await ReturnInvoice.find({ status: true })
          .populate({
            path: 'invoiceDetailId',
            populate: {
              path: 'invoiceId',
              select: 'invoiceNo manualBookNo  date'
            }
          })
          .populate('customerId', 'companyName')
          .populate('itemId', 'name')
          .populate('brandId', 'brandName')
          .lean()

        if (!invoices.length)
          return res.status(404).send({ message: 'return invoices not found' })

        invoices.map((obj, i) => {
          obj['brandName'] = obj.brandId.brandName
          obj['brandId'] = obj.brandId._id
          obj['itemName'] = obj.itemId.name
          obj['itemId'] = obj.itemId._id
          obj['customer'] = obj.customerId ? obj.customerId.companyName : ''
          obj['customerId'] = obj.customerId ? obj.customerId._id : ''
          obj['invoiceNo'] = obj.invoiceDetailId.invoiceId.invoiceNo
          obj['manualBookNo'] = obj.invoiceDetailId.invoiceId.manualBookNo
          obj['invoiceDate'] = obj.invoiceDetailId.invoiceId.date
          obj['invoiceId'] = obj.invoiceDetailId.invoiceId._id
          obj['invoiceDetailId'] = obj.invoiceDetailId._id
          delete obj['invoiceDetailId']
          invoices[i] = obj
        })
        res.status(200).send(invoices)
      } catch (err) {
        return res.status(500).json(errorHandler(err))
      }
    }
  })
}

module.exports.getReturnInvoiceId = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      jwt.verify(req.query.token, process.env.login_key, function (
        err,
        payload
      ) {
        if (err) {
          res.send(401).send({ message: 'not authentic user' })
        } else {
          ReturnInvoice.count()
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
  })
}

module.exports.setReturnInvoice = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let invoiceDetail = await InvoiceDetails.findOne({
          _id: req.body.invoiceDetailId
        }).lean()
        let currentPiece = invoiceDetail.pieceQty - invoiceDetail.returnQty
        if (req.body.totalReturnQty > currentPiece) {
          return res.status(400).send({
            message: 'return quantity can not be greater then selling quantity'
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
          let updatedStockDetails = await addDamageQty(
            stockDetails,
            req.body.damageQty
          )
          let updatedStockDetailsSoldQty = await decreaseSoldQtyStockDetails(
            stockDetails,
            req.body.returnQty
          )
          invoiceDetail['returnQty'] += req.body.totalReturnQty
          await InvoiceDetails.updateOne(
            { _id: invoiceDetail._id },
            { $set: { returnQty: invoiceDetail.returnQty } }
          )
          let createdReturnInvoice = await ReturnInvoiceDetail.create(req.body)

          await addLedgerReport(createdReturnInvoice)

          res.status(200).send({message:'Return Invoice Genrated'})
        }
      } catch (err) {
        res.status(500).json(errorHandler(err))
      }
    }
  })
}

async function addLedgerReport (invoiceDetail) {
  
  let ledger = await LedgerReport.find({ customerId: invoiceDetail.customerId })
    .sort({ createdAt: -1 })
    .limit(1)
  let newObj = {
    balance: 0,
    debit: invoiceDetail.returnAmmount,
    date: invoiceDetail.date,
    description: '',
    customerId: invoiceDetail.customerId,
    invoiceId: invoiceDetail._id
  }
  if (!ledger.length) {
    newObj['balance'] = invoiceDetail.returnAmmount
  } else {
    newObj['balance'] = ledger[0].balance - invoiceDetail.returnAmmount
  }
  let updated = await LedgerReport.create(newObj)
  return updated
}

module.exports.returnWholeInvoice = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      return res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let invoiceDetails = await InvoiceDetails.find({
          invoiceId: req.params.invoiceId
        })
        let invoice = await Invoice.findById(req.params.invoiceId)
        await Promise.all(
          invoiceDetails.map(async detail => {
            let stockDetails = await StockDetails.find({
              itemId: detail.itemId,
              brandId: detail.brandId,
              modelNumber: detail.modelNumber,
              color: detail.color
            })

            stockDetails.sort(function (a, b) {
              return new Date(a.date) - new Date(b.date)
            })

            let updatedStockDetailsSoldQty = await decreaseSoldQtyStockDetails(
              stockDetails,
              detail.pieceQty
            )
          })
        )

        let update = await Invoice.updateOne(
          { _id: req.params.invoiceId },
          { $set: { returnStatus: true } }
        )

        if (!update)
          return res.status(401).send({ message: 'Could not return invoice' })

        let invoices = await Invoice.find({ status: true, returnStatus: false })
          .populate('customerId', 'companyName')
          .lean()
          .exec()

        if (!invoices)
          return res.status(404).send({ message: 'Invoices not found' })

        await Promise.all(
          invoices.map((invoice, i) => {
            invoices[i]['companyName'] = invoice.customerId.companyName
            invoices[i]['customerId'] = invoice.customerId._id
          })
        )

        res.status(200).send(invoices)
      } catch (err) {
        return res.status(500).send(err)
      }
    }
  })
}

async function addDamageQty (stockDetails, damageQty) {
  Promise.all(
    stockDetails.map(async (obj, index) => {
      if (damageQty != 0 && obj.soldQty > 0) {
        if (damageQty <= obj.soldQty) {
          obj.damageQty += damageQty
          obj.soldQty -= damageQty
          damageQty = 0
        } else if (damageQty > obj.soldQty) {
          obj.damageQty += obj.soldQty
          damageQty -= obj.soldQty
          obj.soldQty = 0
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
  try {
    await Promise.all(
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
          } else if (obj.soldQty == returnQty) {
            obj.soldQty = 0
            obj.actualQty += returnQty
            returnQty = 0
          }
          stockDetails[index] = obj
           try{

           
          let update = await StockDetails.updateOne(
            { _id: obj.id },
            { $set: { actualQty: obj.actualQty, soldQty: obj.soldQty } }
          )
          }catch(err){
            throw err
          }
        }
      })
    )
    // .then(() => {
      return true
    // })
  } catch (err) {
    throw err
  }
}
