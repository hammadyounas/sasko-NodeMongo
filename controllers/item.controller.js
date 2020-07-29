const Items = require('../models/item.model')
const jwt = require('jsonwebtoken')
const historyController = require('./history.controller')
const errorHandler = require('../utils/errorHandler')

module.exports.getItems = (req, res) => {
    jwt.verify(req.query.token, process.env.login_key, async function (
      err,
      payload
    ) {
        try{

          if(err) return res.status(401).send({ message: 'not authentic user' })
          
          let list = await Items.find().exec();
          
          if(!list.length) return res.status(404).send({message:'Items Not Found'});
          
          return res.status(200).send(list);
  
        }catch(err){
          return res.status(500).json(errorHandler(err))
        }
    })
}

module.exports.deleteItems = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
      try{
          
        if(err) return res.status(401).send({ message: 'not authentic user' })

        await  Items.remove({ _id: req.params.id });

        let list = await Items.find().exec();

        if(!list.length) return res.status(404).send({message:'Items Not Found'});
        
        return res.status(200).send(list);

      }catch(err){
        return res.status(500).json(errorHandler(err))
      }
  })
}

module.exports.editItems = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key,async function (err, payload) {
      try{  
        
        if(err) return res.status(401).send({ message: 'not authentic user' })

        let result = await  Items.findOne({ name: req.body.name })

        if(result) return res.status(409).send({ message: 'item already exist' });

        await Items.findByIdAndUpdate({ _id: req.body._id },{ name: req.body.name },{ new: true })

        await historyController.addHistory(req.body.history,payload,'Item','update',0)

        let list = await Items.find().exec();

        if(!list.length) return res.status(404).send({message:'Items Not Found'});
        
        return res.status(200).send(list);

      }catch(err){
        return res.status(500).json(errorHandler(err))
      }
  })
}

module.exports.addItems = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
      try{

        if(err) return res.status(401).send({ message: 'not authentic user' })

        let result = await Items.findOne({ name: req.body.name })
        
        if(result) res.status(409).send({ message: 'item already exist' });

        await Items.create(req.body);
        
        await historyController.addHistory( req.body.history,payload,'item','add', 0)
        
        let list = await Items.find().exec();
        
        if(!list.length) return res.status(404).send({message:'items not found'})

        return res.status(200).send(list)

      }catch(err){
        return res.status(500).json(errorHandler(err))
      }
  })
}
