const mongoose = require('mongoose')
const PettyCash = require('../models/petty-cash.model')
const sixDigits = require('../utils/sixDigits')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getPettyCashTransactionId = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (err, payload) {
    try{

      if (err) return res.send(401).send({ message: 'not authentic user' })

      let length = await PettyCash.count();

      let id = sixDigits((length + 1).toString())

      return res.status(200).send({ pettyCashTransactionId: id })

    }catch(err){
      return res.status(500).send(errorHandler(err))
    }
  })
}

module.exports.setPettyCash = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let createPettyCash = await PettyCash.create(req.body)
        
        await historyController.addHistory(
          JSON.stringify(req.body.history),
          payload,
          'Petty Cash',
          'add',
          0
        )

        if(!createPettyCash) return res.status(409).send({message:'Could not add Petty Cash'});
        
        let pettyList = await PettyCash.find().populate('bankId', 'name').lean();

        if(!pettyList.length) return res.status(404).send({message:"Petty List Not Found"});

        pettyList.map((pettyCash,i)=>{
          pettyList[i]['bankName'] = pettyCash.bankId.name;
          pettyList[i]['bankId'] = pettyCash.bankId._id;
        })

        return res.status(200).send(pettyList)

      } catch (err) {
        return res.status(500).send(errorHandler(err))
      }

      // })
    }
  })
}

module.exports.getPettyCashList = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders',async function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{
        let pettyList = await PettyCash.find().populate('bankId', 'name').lean();

        if(!pettyList.length) return res.status(404).send({message:"Petty List Not Found"});

        pettyList.map((pettyCash,i)=>{
          pettyList[i]['bankName'] = pettyCash.bankId.name;
          pettyList[i]['bankId'] = pettyCash.bankId._id;
        })

        return res.status(200).send(pettyList)
      }catch(err){
        return res.status(500).send(errorHandler(err))
      }
    }
  })
}

module.exports.getPettyCashById = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders',async function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{

        let pettyCash = await  PettyCash.findOne({ _id: req.params.id }).populate('bankId', 'name').lean()

          if(!pettyCash) return res.status(404).send({message:"Petty Cash with this id not found"});

        
          pettyCash['bankName']  = pettyCash.bankId.name;
          pettyCash['bankId'] = pettyCash.bankId._id;

          return res.status(200).send(pettyCash);

        }catch(err){
          return res.status(500).send(errorHandler(err))

        }
    }
  })
}

module.exports.updatePettyCash = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {

      PettyCash.findByIdAndUpdate({ _id: req.body._id }, req.body)
        .then(() => {
          PettyCash.findById({ _id: req.body._id })
            .then(async updatePettyCash => {
              let record = await historyController.addHistory(
                req.body.history,
                payload,
                'Payment Recieve',
                'update',
                0
              )
              res.status(200).send(updatePettyCash)
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

/*
  this api is not using now
  */

/*module.exports.deletePettyCash = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      PettyCash.findByIdAndRemove({ _id: req.params.id })
        .then(resp => {
          res.status(200).send(resp)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}*/
