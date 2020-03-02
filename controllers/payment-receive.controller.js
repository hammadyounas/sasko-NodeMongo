const PaymentReceive = require('../models/payment-receive.model')
const errorHandler = require('../utils/errorHandler')
const sixDigits = require('../utils/sixDigits')
const LedgerReport = require('../models/ledger-report.model')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

module.exports.getPaymentReceive = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PaymentReceive.find({ status: true })
        .populate('customerId', 'companyName')
        .populate('bankId', 'name')
        .then(payment_receives => {
          if (!payment_receives.length) {
            res.status(404).send({ message: 'No Data Found' })
          } else {
            res.status(200).send(payment_receives)
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.setPaymentReceive = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      return res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        if ((req.body.requestType == 'debit')) {
          let payment_receive = await PaymentReceive.create(req.body)
          // .then(async payment_receive => {
          let ledgerReport = await setLedgerReport(payment_receive)
          res.status(200).send(payment_receive)
          // })
          // .catch(err => {
          //   res.status(500).json(errorHandler(err))
          // })
        } else if ((req.body.requestType == 'credit')) {
          let updateLedger = await setCreditLedgerReport(req.body)

          if (!updateLedger) return res.status(409).send({ message: 'Ledger Update Error. Could not update ledger' })

          return res.status(200).send(updateLedger)
        
        } else {
          return res.status(409).send({ message: 'Invalid Request Type' })
        }
      } catch (err) {
        return res.status(500).json(errorHandler(err))
      }
    }
  })
}

async function setCreditLedgerReport (body) {
  try {
    let list = await LedgerReport.find({
      customerId: body.customerId
    })
      .sort({ createdAt: -1 })
      .limit(1)
    let newObj = {
      balance: list[0].balance + body.amount,
      description: body.description,
      debit: 0,
      date: body.date,
      customerId: body.customerId,
      credit: list[0].credit + body.amount
    }

    let updated = await LedgerReport.create(newObj)
    return updated
  } catch (err) {
    throw new Error(err)
  }
}

async function setLedgerReport (receivedPayment) {
  let list = await LedgerReport.find({ customerId: receivedPayment.customerId })
    .sort({ createdAt: -1 })
    .limit(1)
  let newObj = {
    balance: 0,
    description: receivedPayment.description,
    debit: receivedPayment.amount,
    date: receivedPayment.date,
    customerId: receivedPayment.customerId,
    bankId: receivedPayment.bankId,
    paymentId: receivedPayment._id
  }
  if (list.length) {
    newObj['balance'] = list[0].balance - receivedPayment.amount
  }
  let updated = await LedgerReport.create(newObj)
  return updated
}

module.exports.getTransactionId = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PaymentReceive.count()
        .then(length => {
          let id = sixDigits((length + 1).toString())
          res.status(200).send({ trasactionsId: id })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}
// getPaymentDetailById
module.exports.getPaymentDetailById = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PaymentReceive.findById(
        { _id: req.params.id, status: true },
        { __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .then(bank => {
          res.status(200).send(bank)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.editPaymentReceive = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PaymentReceive.findByIdAndUpdate(
        { _id: req.body._id, status: true },
        req.body
      )
        .then(() => {
          PaymentReceive.findById({ _id: req.body._id })
            .then(async payment_receive => {
              let record = await historyController.addHistory(
                req.body.history,
                payload,
                'Payment Recieve',
                'update',
                0
              )
              res.status(200).send(payment_receive)
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

module.exports.deletePaymentReceive = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PaymentReceive.findByIdAndUpdate(
        { _id: req.params.id, status: true },
        { $set: { status: false } }
      )
        .then(() => {
          PaymentReceive.findById({ _id: req.params.id })
            .then(payment_receive => {
              res.status(200).send(payment_receive)
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

module.exports.getLedgerReport = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      LedgerReport.find()
        .sort({ createdAt: -1 })
        .populate('customerId', 'companyName')
        .populate('bankId', 'name')
        .lean()
        .then(result => {
          if (!result.length) {
            res.status(404).send({ msg: 'ledger not found' })
          } else {
            Promise.all(
              result.map((report, i) => {
                result[i]['companyName'] = report.customerId.companyName
                result[i]['customerId'] = report.customerId._id
                if (result[i].bankId) {
                  result[i]['bankName'] = report.bankId.name
                  result[i]['bankId'] = report.bankId._id
                }
              })
            ).then(() => {
              result = result.reverse()
              res.status(200).send(result)
            })
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}
