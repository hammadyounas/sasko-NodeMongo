const History = require('./../models/history.model');
const errorHandler = require('../utils/errorHandler');
const ObjectId = require('mongodb').ObjectID;

module.exports.getHistory = async (req,res)=>{
    try{
        let day = req.query.toDate ?  parseInt(req.query.toDate.slice(8,10))+1 : '';
        let toDate = req.query.toDate ? `${req.query.toDate.slice(0,7)}-${day.toString()}` : '';
        let query = {};
        (req.query.userId) ? (query.userId = ObjectId(req.query.userId)) : '';
        (req.query.toDate && !req.query.fromDate)  ? (query.createdAt = {$lte: new Date(toDate).toISOString()}) : '';
        (!req.query.toDate && req.query.fromDate)  ? (query.createdAt = {$gte: new Date(req.query.fromDate).toISOString()}) : '';
        (req.query.toDate && req.query.fromDate)  ? (query.createdAt = {$gte:new Date(req.query.fromDate).toISOString(), $lte:new Date(toDate).toISOString()}) : '';

        let data = await History.find(query).sort({ createdAt: -1 }).skip(parseInt(req.query.skip)).limit(parseInt( 15));

        if(!data.length) return res.status(404).send({message:'history data not found'});

        return res.status(200).send(data);

    }catch(err){
        return res.status(500).json(errorHandler(err))
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
        case 'updateStockDetail':
            newobj['description'] = `Stock detail ${counter}`
            newobj['isType'] = 'update';
            break;
        case 'addInvoiceDetail':
            newobj['description'] = `Invoice detail ${counter}`
            newobj['isType'] = 'add';
            break;
        case 'updateInvoiceDetail':
            newobj['description'] = `Invoice detail ${counter}`
            newobj['isType'] = 'update';
            break;
      }
      let upadted = await History.create(newobj);
      return upadted;
};

module.exports.addHistory = addHistory