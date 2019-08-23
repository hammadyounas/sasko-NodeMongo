const Brands = require('../models/brand.model');
const Items = require('../models/item.model');


module.exports.getBrands = (req, res) => {

    Brands.find().then(Brands => {
        res.send(Brands)
    }).catch(error => {
        res.send(error)
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


module.exports.editBrands = async (req, res) => {
    let searchBrands = await Brands.findOne({ "data._id": req.body.brandId });
    
    searchBrands.data.map(x => {
        if (x._id == req.body.brandId) {
            x.BrandName = req.body.BrandName;
            x.updatedAt = Date.now();
        }
    })

    Brands.findOneAndUpdate(
        { "data._id": req.body.brandId },
        {
            $set: {
                data: searchBrands.data
            }
        }, { useFindAndModify: false }).exec(data => {

            res.send(req.body);
        })
}






module.exports.deleteBrands = async (req, res) => {
   
    let searchBrands = await Brands.findOne({ "data._id": req.params.brandId });
    if(searchBrands != null) { 
    searchBrands.data = searchBrands.data.filter(item => item._id != req.params.brandId)
    Brands.findOneAndUpdate(
        { "data._id": req.params.brandId },
        {
            $set: {
                data: searchBrands.data
            }
        }).exec(data => {
            res.send(data);
        })
    } else {
        res.send({"Error" : "Id not fount"});
    }
}

module.exports.getItemBrands = async (req,res)=>{
    try{
        // console.log("req body ->",req.body);
    let getItemBrands = await Brands.find({itemId:req.body.itemId});
    // console.log("getItemBrands",getItemBrands);
    res.status(200).send(getItemBrands[0].data);
    }catch(error) {
        res.status(500).send(error)
        //  Block of code to handle errors
      }
}