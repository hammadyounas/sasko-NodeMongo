const Customer = require('../models/customer.model')
const errorHandler = require('../utils/errorHandler')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

module.exports.getCustomer = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if(err) return res.status(401).send({ message: 'not authentic user' })

      let customers = await Customer.find({ status: true })

      if(!customers.length) return res.status(404).send({ message: 'No Customers Found' })

      return res.status(200).send(customers)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.getCustomerById = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if(err) return res.status(401).send({ message: 'not authentic user' })

      let customer = await Customer.findById({ _id: req.params.id, status: true })

      if(!customer) return res.status(404).send({ message: 'No customer Found' })

      return res.status(200).send(customer)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.setCustomer = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if (err) return res.send(401).send({ message: 'not authentic user' })

      let result = await Customer.findOne({clientName: req.body.clientName,companyName: req.body.companyName});

      if(result) return res.status(409).send({ message: 'customer already exist' });

      await Customer.create(req.body);

      await historyController.addHistory(req.body.history,payload,'Customer','add',0);

      let customers = await Customer.find({ status: true });

      return res.status(200).send(customers);

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.editCustomer = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.status(401).send({ message: 'not authentic user' });

      let result = await Customer.findById({ _id: req.body._id });

      if(!result) return res.status(409).send({ message: 'customer not exist' });

      await Customer.findByIdAndUpdate({ _id: req.body._id, status: true },req.body);

      await historyController.addHistory(req.body.history,payload,'Customer','update',0);

      let customers = await Customer.find({ status: true });

      return res.status(200).send(customers);

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.deleteCustomer = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' })

      await Customer.findByIdAndUpdate({ _id: req.params.id, status: true },{ $set: { status: false } });

      let customer = await  Customer.findById({ _id: req.params.id });

      return res.status(200).send(customer);

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}
