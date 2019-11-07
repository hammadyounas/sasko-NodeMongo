const History = require('./../models/history.model');
const errorHandler = require('../utils/errorHandler');
const ObjectId = require('mongodb').ObjectID;

module.exports.getHistory = (req,res)=>{
    let userId =  req.query.userId;
    // let 
    if(userId != ''){
        History.find({userId:ObjectId(userId)}).sort({ createdAt: -1 }).skip(parseInt(req.query.skip)).limit(parseInt( req.query.limit)).then(data =>{
            if(data.length){
                res.status(200).send(data);
            }else{
                res.status(404).send({message:'not found'});
            }
        })
    }else {
        History.find().sort({ createdAt: -1 }).skip(parseInt(req.query.skip)).limit(parseInt( req.query.limit)).then(data =>{
            if(data.length){
                res.status(200).send(data);
            }else{
                res.status(404).send({message:'not found'});
            }
        })
    }
}