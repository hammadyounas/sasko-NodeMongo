const Brands = require('../models/brand.model');
const Items = require('../models/item.model');



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
    itemQuery = Brand.map((brandDetails, index) => {

         return Items.findById({ "_id": brandDetails['itemId'] }).exec().then(data => {


            if (data != null) {
                brandDetails['itemName'] = data.name;
            } else {
                brandDetails['itemName'] = "Item is deleted";   
            }
        })

    })

    Promise.all(itemQuery).then(data => {
        res.send({ 'brands': Brand })
    })

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
        // console.log("req body ->",req.body);
        let getItemBrands = await Brands.find({ itemId: req.body.itemId });
        // console.log("getItemBrands",getItemBrands);
        res.status(200).send(getItemBrands);
    } catch (error) {
        res.status(500).send(error)
        //  Block of code to handle errors
    }
}