const Bank = require('../models/bank.model')
const errorHandler = require('../utils/errorHandler')

module.exports.getBank = (req, res) => {
  Bank.find({ status: true })
    .then(banks => {
      if (banks.length) {
        res.status(200).send(banks)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.setBank = (req, res) => {
  Bank.create(req.body)
    .then(bank => {
      res.status(200).send(bank)
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.editBank = (req, res) => {
  Bank.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body)
    .then(() => {
      Bank.findById({ _id: req.body._id })
        .then(bank => {
          res.status(200).send(bank)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.getBankById = (req, res) => {
  Bank.findById({ _id: req.params.id, status: true })
    .then(bank => {
      res.status(200).send(bank)
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.deleteBank = (req, res) => {
  Bank.findByIdAndUpdate(
    { _id: req.params.id, status: true },
    { $set: { status: false } }
  )
    .then(() => {
      Bank.findById({ _id: req.params.id })
        .then(bank => {
          res.status(200).send(bank)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}
