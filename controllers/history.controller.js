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
                res.status(404).send({message:'Data not found'});
            }
        })
    }else {
        History.find().sort({ createdAt: -1 }).skip(parseInt(req.query.skip)).limit(parseInt( req.query.limit)).then(data =>{
            if(data.length){
                res.status(200).send(data);
            }else{
                res.status(404).send({message:'Data not found'});
            }
        })
    }
}

async function addHistory(obj, payload, feature, type,counter) {
    let newobj = {
        userId: payload._id,
        description: '',
        isType:'',
        changes: obj
      }
      switch(type){
        case 'update':
            newobj['description'] = `${payload.userName} has updated in ${feature}`,
            newobj['isType'] = 'update';
            break;
        case 'add':
            newobj['description'] = `${payload.userName} has added in ${feature}`
            newobj['isType'] = 'add';
            break;
        case 'addStockDetail':
            newobj['description'] = `Stock detail ${counter}`
            newobj['isType'] = 'add';
            break;

      }
      let upadted = await History.create(newobj);
      return upadted;
};

module.exports.addHistory = addHistory