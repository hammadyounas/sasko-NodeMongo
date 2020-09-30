const PettyCash = require('../models/petty-cash.model')
const sixDigits = require('../utils/sixDigits')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler')


module.exports.getPettyCashTransactionId = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if (err) return res.send(401).send({ message: 'not authentic user' });

      let length = await PettyCash.count();

      let id = sixDigits((length + 1).toString());

      return res.status(200).send({ pettyCashTransactionId: id });

    }catch(err){
      return res.status(500).send(errorHandler(err));
    }
  })
}

module.exports.setPettyCash = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
      try {

        if(err) return res.send(401).send({ message: 'not authentic user' });

        let createPettyCash = await PettyCash.create(req.body);
        
        await historyController.addHistory(req.body.history,payload,'Petty Cash','add',0)

        if(!createPettyCash) return res.status(409).send({message:'Could not add Petty Cash'});
        
        let pettyList = await PettyCash.find().populate('bankId', 'name').lean();

        if(!pettyList.length) return res.status(404).send({message:"Petty List Not Found"});

        pettyList.map((pettyCash,i)=>{
          pettyList[i]['bankName'] = pettyCash.bankId.name;
          pettyList[i]['bankId'] = pettyCash.bankId._id;
        })

        return res.status(200).send(pettyList);

      } catch (err) {
        return res.status(500).send(errorHandler(err));
      }
  })
}

module.exports.getPettyCashList = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key,async function (err, payload) {
      try{

        if(err) return  res.send(401).send({ message: 'not authentic user' });

        let pettyList = await PettyCash.find().populate('bankId', 'name').lean();

        if(!pettyList.length) return res.status(404).send({message:"Petty List Not Found"});

        pettyList.map((pettyCash,i)=>{
          pettyList[i]['bankName'] = pettyCash.bankId.name;
          pettyList[i]['bankId'] = pettyCash.bankId._id;
        })

        return res.status(200).send(pettyList);

      }catch(err){
        return res.status(500).send(errorHandler(err));
      }
  })
}

module.exports.getPettyCashById = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key,async function (err, payload) {
      try{

        if (err) return res.send(401).send({ message: 'not authentic user' });

        let pettyCash = await  PettyCash.findOne({ _id: req.params.id }).populate('bankId', 'name').lean();

        if(!pettyCash) return res.status(404).send({message:"Petty Cash with this id not found"});

        pettyCash['bankName']  = pettyCash.bankId.name;
        pettyCash['bankId'] = pettyCash.bankId._id;

        return res.status(200).send(pettyCash);

        }catch(err){
          return res.status(500).send(errorHandler(err));
        }
  })
}

module.exports.updatePettyCash = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if (err) return res.send(401).send({ message: 'not authentic user' });

      await PettyCash.findByIdAndUpdate({ _id: req.body._id }, req.body);

      let updatePettyCash = await PettyCash.findById({ _id: req.body._id });
    
      await historyController.addHistory(req.body.history,payload,'patty cash','update',0);

      return res.status(200).send(updatePettyCash);

    }catch(err){
      return res.status(500).send(errorHandler(err));
    }
  })
}

/*
  this api is not using now
  */

/*module.exports.deletePettyCash = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, function (err, payload) {
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
