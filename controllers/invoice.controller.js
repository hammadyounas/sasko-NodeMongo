const Invoice = require('../models/invoice.model')
const InvoiceDetails = require('../models/invoice-details.model')
const Customer = require('../models/customer.model')
const errorHandler = require('../utils/errorHandler')
const getInvoiceNumber = require('../utils/invoiceNumberGenerator')
const sixDigits = require('../utils/sixDigits')

module.exports.getInvoice = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.find({ status: true })
        .populate('customerId', 'clientName')
        .then(invoices => {
          if (!invoices.length) {
            res.status(404).send({ message: 'No Data Found' })
          } else {
            res.status(200).send(invoices)
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
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
