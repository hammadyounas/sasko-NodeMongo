const PaymentReceive = require('../models/payment-receive.model')
const errorHandler = require('../utils/errorHandler')
const sixDigits = require('../utils/sixDigits')
const LedgerReport = require('../models/ledger-report.model')

module.exports.getPaymentReceive = (req, res) => {
  PaymentReceive.find({ status: true })
    .populate('customerId')
    .populate('bankId')
    .then(payment_receives => {
      res.status(200).send(payment_receives)
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.setPaymentReceive = (req, res) => {
  PaymentReceive.create(req.body)
    .then(async payment_receive => {
      let ledgerReport = await setLedgerReport(payment_receive);
      res.status(200).send(payment_receive)
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
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
    paymentId: receivedPayment._id
  }
  if (list.length) {
    newObj['balance'] = list[0].balance - receivedPayment.amount
  }
  let updated = await LedgerReport.create(newObj)
  return updated;
}

module.exports.getTransactionId = (req, res) => {
  PaymentReceive.count()
    .then(length => {
      let id = sixDigits((length + 1).toString())
      res.status(200).send({ trasactionsId: id })
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}
// getPaymentDetailById
module.exports.getPaymentDetailById = (req, res) => {
  PaymentReceive.findById({ _id: req.params.id, status: true })
    .then(bank => {
      res.status(200).send(bank)
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.editPaymentReceive = (req, res) => {
  PaymentReceive.findByIdAndUpdate(
    { _id: req.body._id, status: true },
    req.body
  )
    .then(() => {
      PaymentReceive.findById({ _id: req.body._id })
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

module.exports.deletePaymentReceive = (req, res) => {
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

module.exports.getLedgerReport = (req, res) => {
  LedgerReport.find()
    .sort({ createdAt: -1 })
    .populate('customerId', 'clientName')
    .lean()
    .then(result => {
      if (!result.length) {
        res.status(404).send({ msg: 'ledger not found' })
      } else {
        Promise.all(
          result.map((report, i) => {
            result[i]['customerName'] = report.customerId.clientName
            result[i]['customerId'] = report.customerId._id
          })
        ).then(() => {
          res.status(200).send(result)
        })
      }
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}
