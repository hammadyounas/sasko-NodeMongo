const Brands = require('../models/brand.model');
const Items = require('../models/item.model');


module.exports.getBrands = (req, res) => {

    Brands.find().then(Brands => {
        res.status(200).json({ Brands })
    }).catch(error => {
        res.status(200).json({ "wow": error })
    })
}
module.exports.addBrands = async (req, res) => {

    let searchBrands = await Brands.findOne({ "itemId": req.body.itemId })
    let Item = await Items.findOne({ "_id": req.body.itemId });
    console.log(Item);
    req.body.data.map(x => {
        x['itemName'] = Item.name;
    })

    if (searchBrands == null) {
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

        console.log(req.body.data);
        await Brands.findOneAndUpdate(
            { "itemId": req.body.itemId },
            {
                $push: {
                    data: req.body.data
                }
            }, { useFindAndModify: false }).exec().then(data => {
                res.send(req.body);
            }).catch(error => {
                res.status(500).json({
                    stack: error.stack,
                    code: error.code,
                    message: error.message
                })
            })
    }

}

module.exports.eeditBrands = (req, res) => {

    Brands.findOneAndUpdate(
        { "name": req.body.name },
        {
            $set: {
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


module.exports.editBrands = (req, res) => {




    Brands.find(
        { "data._id": req.body._id },

    )
        .then(data => {
            // console.log(data);
            // res.send(data)
            let brands = data[0].data;
            // console.log(brands);

            brands.map((x, index) => {

                if (x._id == req.body._id) {
                    brands[index] = req.body
                    console.log(index);

                    // res.send(brands);
                    Brands.findOneAndUpdate(
                        { "data._id": req.body._id },
                        {
                            $set: { "asd": "asd" }
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
            })
            // console.log(a);

            // newData.save({
            //     "itemId": "12345",
            //     "BrandName": "Editttttttttt"
            // })
        }).catch(error => {
            res.status(500).json({
                stack: error.stack,
                code: error.code,
                message: error.message
            })
        })


    // Brands.findOneAndUpdate(
    //     { "data._id": req.body._id },
    //     {
    //         $set: {
    //             "data.itemId": "12345",
    //             "data.BrandName": "Editttttttttt"
    //         }
    //     }, { useFindAndModify: false }).exec().then(data => {
    //         res.send(data);
    //     }).catch(error => {
    //         res.status(500).json({
    //             stack: error.stack,
    //             code: error.code,
    //             message: error.message
    //         })
    //     })
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