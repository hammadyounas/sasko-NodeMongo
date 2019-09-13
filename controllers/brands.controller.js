const Brands = require('../models/brand.model')
const Items = require('../models/item.model')
const utilFunction = require('../utils/ReplaceName')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getBrandsWithItems = async (req, res) => {
  try {
    let brands = await Brands.find()
    let arr = []
    Promise.all(
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
    ).then(result => {
      res.status(200).send(arr)
    })
  } catch (err) {
    res.status(500).send({ msg: 'internal server error' })
  }
}

module.exports.getBrands = async (req, res) => {
  let brands = await Brands.find().populate('itemId')
  res.status(200).send(brands)
}

module.exports.addBrands = (req, res) => {
  let brands = req.body
  let addBrands = []
  Promise.all(
    brands.map(async obj => {
      let resp = await Brands.findOne({
        itemId: obj.itemId,
        brandName: obj.brandName
      })
      if (!resp) {
        addBrands.push(obj)
      }
    })
  ).then(result => {
    Brands.create(addBrands)
      .then(function (brands) {
        res.send(brands)
      })
      .catch(error => {
        res.status(500).json(errorHandler(error))
      })
  })
}

module.exports.editBrands = async (req, res) => {
  obj = req.body;
  let resp = await Brands.findOne({
    itemId: obj.itemId,
    brandName: obj.brandName
  })
  if (!resp) {
    Brands.findByIdAndUpdate(
      { _id: req.body._id },
      { brandName: req.body.brandName, itemId: req.body.itemId._id },
      { new: true }
    ).exec((error, doc) => {
      if (error) res.status(500).json(errorHandler(error))
      res.send(doc)
    })
  }else{
    res.status(409).send({msg:'conflict with same item name and brand name'});
  }
}

module.exports.deleteBrands = async (req, res) => {
  Brands.remove({ _id: req.params.id })
    .then(brands => {
      res.send(brands)
    })
    .catch(error => {
      res.status(500).json(errorHandler(error))
    })
}

module.exports.getItemBrands = async (req, res) => {
  try {
    let getItemBrands = await Brands.find({ itemId: req.body.itemId })
    utilFunction
      .replace(getItemBrands, Items)
      .then(data => {
        res.send(data)
      })
      .catch(error => {
        res.status(500).json(errorHandler(error))
      })
  } catch (error) {
    res.status(500).send(errorHandler(error))
  }
}
