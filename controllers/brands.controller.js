const Brands = require('../models/brand.model')
const Items = require('../models/item.model')
const utilFunction = require('../utils/ReplaceName')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler')

module.exports.getBrandsWithItems = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let brands = await Brands.find()
      
      let arr = []

      await  Promise.all(
        brands.map(async obj => {
          let item = await Items.findOne({ _id: obj.itemId })
          let tempObj = {
            brandName: obj.brandName,
            _id: obj._id,
            itemId: obj.itemId,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt,
            itemName: item.name
          }
          arr.push(tempObj)
        })
      )

      return res.status(200).send(arr)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.getBrands = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
      try {
        
        if(err) return res.send(401).send({ message: 'not authentic user' });

        let brands = await Brands.find().populate('itemId','name');

        if(!brands.length) return res.status(404).send({ msg: 'No Data Found' })
          
        return res.status(200).send(brands)

      } catch (err) {
        return res.status(500).json(errorHandler(err))
      }

  })
}

module.exports.addBrands = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{

        let brands = req.body.brands;

        let addBrands = [];

        await Promise.all(
          brands.map(async obj => {
            let resp = await Brands.findOne({
              itemId: obj.itemId,
              brandName: obj.brandName
            })
            if (!resp) {
              addBrands.push(obj)
            }
          })
        )
              
        await Brands.create(addBrands);

        await historyController.addHistory(req.body.history,payload,'Brand','add',0);

        let currentBrands = await Brands.find().populate('itemId','name');

        if(!currentBrands.length) return res.status(404).send({ msg: 'No Brands Data Found' });
          
        return res.status(200).send(currentBrands);

      }catch(err){
        return res.status(500).json(errorHandler(err))
      }
     
      
    }
  })
}

module.exports.editBrands = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{

      if(err) return  res.send(401).send({ message: 'not authentic user' })

      let resp = await Brands.findOne({itemId: req.body.itemId,brandName: req.body.brandName});

      if(resp) return res.status(409).send({ message: 'conflict with same item name and brand name' })

      let doc = await Brands.findByIdAndUpdate(
        { _id: req.body._id },
        { brandName: req.body.brandName, itemId: req.body.itemId._id },
        { new: true }
      ).exec();

      await historyController.addHistory(
        req.body.history,
        payload,
        'Brand',
        'update',
        0
      );

      return res.status(200).send(doc)


    }catch(err){
      return res.status(500).json(errorHandler(error))
    }
  })
}

module.exports.deleteBrands = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' })

      let brands = await Brands.remove({ _id: req.params.id });

      return res.status(200).send(brands)


    }catch(err){
      return res.status(500).json(errorHandler(error))
    }
  })
}

module.exports.getItemBrands = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' })

      let getItemBrands = await Brands.find({ itemId: req.body.itemId })

      let data = await utilFunction.replace(getItemBrands, Items);

      return res.status(200).send(data);

    }catch(err){
      return res.status(500).send(errorHandler(error))
    }
  })
}
