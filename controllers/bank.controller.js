const Bank = require('../models/bank.model')
const errorHandler = require('../utils/errorHandler')
const PaymentRecieve = require('../models/payment-receive.model')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

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

module.exports.getBankListing = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{
        
        let data = await PaymentRecieve.find({},{ createdAt: 0, updatedAt: 0, status: 0, __v: 0, customerId: 0 }).populate('bankId', 'name').lean()

        if(!data.length) return res.status(404).send({ message: 'no data found' })

        await Promise.all(
          data.map((list,i)=>{
            data[i]['bankName'] = list.bankId.name;
            data[i]['bankId'] = list.bankId._id
          })
        )

        return res.status(200).send(data);

      }catch(err){
        return res.status(500).send(errorHandler(err))
      }
    }
  })
}

module.exports.setBank = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let addBank = await Bank.create(req.body)

        let record = await historyController.addHistory(
          req.body.history,
          payload,
          'Bank',
          'add',
          0
        )
        let banks = await Bank.find({ status: true })

        if (!banks) return res.status(404).send({ message: 'Banks Not Found' })

        return res.status(200).send(banks)
      } catch (err) {
        return res.status(500).json(errorHandler(err))
      }
    }
  })
}

module.exports.editBank = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        await Bank.findByIdAndUpdate(
          { _id: req.body._id, status: true },
          req.body
        )

        await historyController.addHistory(
          req.body.history,
          payload,
          'Bank',
          'update',
          0
        )
        let banks = await Bank.find({ status: true })

        if (!banks) return res.status(404).send({ message: 'Banks Not Found' })

        return res.status(200).send(banks)
      } catch (err) {
        return res.status(500).json(errorHandler(err))
      }
    }
  })
}

module.exports.getBankById = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Bank.findById({ _id: req.params.id, status: true })
        .then(bank => {
          res.status(200).send(bank)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
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
