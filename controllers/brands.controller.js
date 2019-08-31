const Brands = require('../models/brand.model');
const Items = require('../models/item.model');
const utilFunction = require('../utils/ReplaceName');


let errorHandler = error => {
    return {
        stack: error.stack,
        code: error.code,
        message: error.message
    }
}



module.exports.getBrands = async (req, res) => {
    let Brand = await Brands.find();
    let itemQuery;

    utilFunction.replace(Brand,Items)
        .then(data => {
            console.log(data);
            res.send({ 'brands': data })
        })
        .catch(error => res.status(500).json(errorHandler(error)))

}

module.exports.addBrands = (req, res) => {
    Brands.create(req.body).then(function (brands) {
        res.send(brands)
    }).catch(error => {
        res.status(500).json(errorHandler(error))
    })
}

module.exports.editBrands = (req, res) => {

    Brands.findByIdAndUpdate({ _id: req.body._id }, { brandName: req.body.brandName }, { new: true }).exec((error, doc) => {
        if (error)
            res.status(500).json(errorHandler(error))

        res.send(doc)
    })

}



module.exports.deleteBrands = async (req, res) => {
    Brands.remove({ _id: req.params.id }).then(brands => {
        res.send(brands)
    }).catch(error => {
        res.status(500).json(errorHandler(error))
    })
}


module.exports.getItemBrands = async (req, res) => {
    try {
        let getItemBrands = await Brands.find({ itemId: req.body.itemId });
        utilFunction.replace(getItemBrands, Items).then(data => {
            res.send(data);
        }).catch(error => {
            res.status(500).json(errorHandler(error))
        })

    } catch (error) {
        res.status(500).send(error)
    }
}