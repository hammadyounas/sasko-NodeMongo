const Brands = require('../models/brand.model')

module.exports.getBrands = (req, res) => {

    Brands.find().then(Brands => {
        res.status(200).json({ Brands })
    }).catch(error => {
        res.status(200).json({ "wow": error })
    })
}
module.exports.addBrands = async (req, res) => {

    let a = await Brands.findOne({ "name": req.body.name })
    if (a == null) {
        Brands.create(req.body).then(function (ninja) {
            res.send(ninja)
        }).catch(error => {
            res.status(500).json({
                stack: error.stack,
                code: error.code,
                message: error.message
            })
        })
    } else {
        await Brands.findOneAndUpdate(
            { "name": req.body.name },
            {
                $push: {
                    data: req.body.data
                }
            }, { useFindAndModify: false }).exec().then(data => {
                res.send(data);
            }).catch(error => {
                res.status(500).json({
                    stack: error.stack,
                    code: error.code,
                    message: error.message
                })
            })
    }

}


module.exports.editBrands = (req, res) => {


    // Brands.find(
    //     { "data._id": req.body._id },

    // ).exec()
    //     .then(data => {
    //         let newData = data[0].data.find(x => 
    //             x._id === req.body._id
    //         )

    //         newData.save({	"itemId": "12345",
    //         "BrandName" : "Editttttttttt"})
    //     }).catch(error => {
    //         res.status(500).json({
    //             stack: error.stack,
    //             code: error.code,
    //             message: error.message
    //         })
    //     })


     Brands.findOneAndUpdate(
        { "data._id": req.body._id },
        {
            $set: {
                "data.itemId": "12345",
                "data.BrandName": "Editttttttttt"
            }
        }, { useFindAndModify: false }).exec().then(data => {
            res.send(data);
        }).catch(error => {
            res.status(500).json({
                stack: error.stack,
                code: error.code,
                message: error.message
            })
        })
}





module.exports.deleteBrands = (req, res) => {

    Brands.remove({}).then(function (ninja) {
        res.send(ninja)
    }).catch(error => {
        res.status(500).json({
            stack: error.stack,
            code: error.code,
            message: error.message
        })
    })
}