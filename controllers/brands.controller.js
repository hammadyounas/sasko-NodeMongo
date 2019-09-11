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
  res.status(200).send(brands);
}

module.exports.addBrands = (req, res) => {
  Brands.create(req.body)
    .then(function (brands) {
      res.send(brands)
    })
    .catch(error => {
      res.status(500).json(errorHandler(error))
    })
}

module.exports.editBrands = (req, res) => {
  Brands.findByIdAndUpdate(
    { _id: req.body._id },
    { brandName: req.body.brandName,itemId:req.body.itemId },
    { new: true }
  ).exec((error, doc) => {
    if (error) res.status(500).json(errorHandler(error))

    res.send(doc)
  })
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
