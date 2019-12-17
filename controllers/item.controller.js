const Items = require('../models/item.model')
const jwt = require('jsonwebtoken')
const History = require('../models/history.model')
const historyController = require('./history.controller')

module.exports.getItems = (req, res) => {
  if (req.query.token != undefined) {
    jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
      err,
      payload
    ) {
      if (err) {
        res.status(401).send({ message: 'not authentic user' })
      } else {
        try{
          
          let list = await Items.find().exec();
          
          if(!list.length) return res.status(404).send({msg:'Items Not Found'});
          
          res.status(200).send(list);
  
        }catch(err){
          res.status(500).send(err);
        }
      }
    })
  }else{
    res.status(401).send({ message: 'not authentic user' });
  }
}

module.exports.deleteItems = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{
          
        let item = await  Items.remove({ _id: req.params.id });

        let list = await Items.find().exec();

        if(!list.length) return res.status(404).send({msg:'Items Not Found'});
        
        res.status(200).send(list);

      }catch(err){
        res.status(500).send(err);
      }
    }
  })
}

module.exports.editItems = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders',async function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{        
        let result = await  Items.findOne({ name: req.body.name })

        if(result) return res.status(409).send({ msg: 'item already exist' });

        let editItem = await Items.findByIdAndUpdate({ _id: req.body._id },{ name: req.body.name },{ new: true })

        let record = await historyController.addHistory(req.body.history,payload,'Item','update',0)

        let list = await Items.find().exec();

        if(!list.length) return res.status(404).send({msg:'Items Not Found'});
        
        res.status(200).send(list);

      }catch(err){
        res.status(500).send(err);
      }
    }
  })
}

module.exports.addItems = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (err, payload) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{
        let result = await Items.findOne({ name: req.body.name })
        
        if(result) res.status(409).send({ msg: 'item already exist' });

        let ninja = await Items.create(req.body);
        
        let record = await historyController.addHistory( req.body.history,payload,'item','add', 0)
        
        let list = await Items.find().exec();
        
        if(!list.length) return res.status(404).send({msg:'items not found'})

        res.status(200).send(list)

      }catch(err){
        res.status(500).send(err);
      }
    }
  })
}
