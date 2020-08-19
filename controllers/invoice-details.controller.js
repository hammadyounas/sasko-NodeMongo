const mongoose = require('mongoose')
const Invoice = require('../models/invoice.model')
const InvoiceDetails = require('../models/invoice-details.model')
const errorHandler = require('../utils/errorHandler')
const StockDetails = require('../models/stock-details.model')
const LedgerReport = require('../models/ledger-report.model')
const Customer = require('../models/customer.model')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')
const ReturnInvoice = require('../models/return-invoice.model');

module.exports.getInvoiceDetails = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{ 

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let invoiceDetails = await  InvoiceDetails.find({ status: true })

      if(invoiceDetails) return res.status(404).send({message:"invoice details not found"});

      return res.status(200).send(invoiceDetails)

    }catch(err) {
      return res.status(500).json(errorHandler(err))
  }
  })
}

module.exports.getInvoiceDetailWithInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' })

      let result = await InvoiceDetails.findOne({ status: true, _id: req.params.id }).populate('brandId', 'brandName').populate('itemId', 'name').populate({path: 'invoiceId',populate: { path: 'customerId', select: 'companyName' }}).lean()

      if(!result) return res.status(404).send({ message: 'invoice details not found' });

      let obj = { invoice: result.invoiceId }
      
      obj.invoice['companyName'] = obj.invoice.customerId.companyName;
      
      obj.invoice['customerId'] = obj.invoice.customerId._id;
      
      result['brandName'] = result.brandId.brandName;
      
      result.brandId = result.brandId._id;
      
      result['itemName'] = result.itemId.name;
      
      result.itemId = result.itemId._id;
      
      delete result['invoiceId'];
      
      obj['invoiceDetail'] = result;
      
      return res.status(200).send(obj);

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.addInvoiceDetailsWithInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
      try {

        if(err) return res.send(401).send({ message: 'not authentic user' })

        let invoiceDetailsArray, invoiceVar;

        req.body.invoice['_id'] = new mongoose.Types.ObjectId();

        let invoiceHistory = req.body.invoice.history;

        delete req.body.invoice['history'];
                
        let result = await Invoice(req.body.invoice).save();

        invoiceVar = result;

        await addLedgerReport(result)

        req.body.invoiceDetails.map((x, i) => {
          
          historyController.addHistory(x.history,payload,'invoice','addInvoiceDetail',req.body.invoiceDetails.length - i);
          x['invoiceId'] = req.body.invoice._id;

          })

        await Promise.all(
          req.body.invoiceDetails.map(async detail => {
                
            let stockDetails = await StockDetails.find({itemId: detail.itemId,brandId: detail.brandId,modelNumber: detail.modelNumber,color: detail.color},{ actualQty: 1, soldQty: 1, date: 1 })

            stockDetails.sort(function (a, b) {return new Date(a.date) - new Date(b.date)});
                
            let pieceQty = detail.pieceQty;
                
            await Promise.all(
              stockDetails.map(async (obj, index) => {
                if (pieceQty != 0 && obj.actualQty > 0) {
                    
                  if (obj.actualQty < pieceQty) {
                  
                    pieceQty -= obj.actualQty;
                    obj.soldQty += obj.actualQty;
                    obj.actualQty = 0;
                  
                  } else if (obj.actualQty > pieceQty) {
                  
                    obj.actualQty -= pieceQty;
                    obj.soldQty += pieceQty;
                    pieceQty = 0;
                  
                  } else if (obj.actualQty == pieceQty) {
                 
                    obj.actualQty = 0
                    obj.soldQty += pieceQty
                    pieceQty = 0
                  
                  }
                      
                  stockDetails[index] = obj;

                  await StockDetails.updateOne({ _id: obj.id },{$set: {actualQty: obj.actualQty,soldQty: obj.soldQty}});
               
                }
              })
            )
          })
        )
         const promise = InvoiceDetails.insertMany(req.body.invoiceDetails)
            .then(data => {
                historyController.addHistory(invoiceHistory,payload,'invoice','add',0)
                invoiceDetailsArray = data
              })
              .catch(err => {
                res.status(500).json(errorHandler(err))
              })
          
          Promise.all([promise]).then(() => {
          
          return res.status(200).send({invoice: invoiceVar,invoiceDetails: invoiceDetailsArray});

        })
      } catch (err) {
        res.status(500).json(errorHandler(err))
      }
  })
}

async function addLedgerReport (invoiceDetail,type) {

      let ledger = await LedgerReport.find({ customerId: invoiceDetail.customerId }).sort({ createdAt: -1 }).limit(1);
  
      let newObj = {balance: 0,credit: invoiceDetail.totalNetCost,date: invoiceDetail.date,description: '',customerId: invoiceDetail.customerId,invoiceId: invoiceDetail._id};
  
      (!ledger.length) ? newObj['balance'] = invoiceDetail.totalNetCost : newObj['balance'] = invoiceDetail.totalNetCost + ledger[0].balance;
  
      let updated = await LedgerReport.create(newObj);
  
      return updated;
  
}

async function updateLedgerOnEditInvoice(oldInvoice,newInvoice){
  let ledger = await LedgerReport.find({ customerId: newInvoice.customerId }).sort({ createdAt: -1 }).limit(1).lean();

  if(!ledger.length) throw {message:'unable to find the ledger transaction'};

  if(oldInvoice.totalNetCost == newInvoice.totalNetCost) return true;

  let newObj = {balance: 0,date: newInvoice.date,description: '',customerId: newInvoice.customerId,invoiceId: newInvoice._id};

  newObj = oldInvoice.totalNetCost >= newInvoice.totalNetCost ? {...newObj,balance: ledger[0].balance - (oldInvoice.totalNetCost - newInvoice.totalNetCost),debit:oldInvoice.totalNetCost - newInvoice.totalNetCost,description:'invoice updated customer decrease items quantity'} : {...newObj, balance:ledger[0].balance + (newInvoice.totalNetCost - oldInvoice.totalNetCost ),credit:(newInvoice.totalNetCost - oldInvoice.totalNetCost ),description:'invoice updated customer increase items quantity'};

  let updated = await LedgerReport.create(newObj);
  
  return updated;
}

module.exports.editInvoiceDetailsWithInvoice = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {

      try {

        if(err) return  res.send(401).send({ message: 'not authentic user' });

        if (req.body.invoice.postedStatus) return res.status(404).send({ message: 'can not edit this invoice detail' });

        let invoiceHistory = req.body.invoice.history;

        delete req.body.invoice['history'];

        const invoice = await Invoice.findByIdAndUpdate({ _id: req.body.invoice._id },req.body.invoice).lean()

        await updateLedgerOnEditInvoice(invoice,req.body.invoice )

        await Promise.all(
            
          req.body.invoiceDetails.map(async (invoiceDetail, i) => {
              
            let stockDetails = await StockDetails.find({itemId: invoiceDetail.itemId,brandId: invoiceDetail.brandId,modelNumber: invoiceDetail.modelNumber,color: invoiceDetail.color},{ actualQty: 1, soldQty: 1, date: 1 })
              
            if (invoiceDetail._id) {
                
              let oldInvoiceDetail = await InvoiceDetails.findOne({_id: invoiceDetail._id})
                
              if (invoiceDetail.itemId != oldInvoiceDetail.itemId || invoiceDetail.brandId != oldInvoiceDetail.brandId || invoiceDetail.modelNumber != oldInvoiceDetail.modelNumber || invoiceDetail.color != oldInvoiceDetail.color) {
                
                let pieceQty = oldInvoiceDetail.pieceQty
                
                let oldStockDetails = await StockDetails.find({itemId: oldInvoiceDetail.itemId,brandId: oldInvoiceDetail.brandId,modelNumber: oldInvoiceDetail.modelNumber,color: oldInvoiceDetail.color},{ actualQty: 1, soldQty: 1, date: 1 })
                  
                await decreaseSoldQtyStockDetails(oldStockDetails,pieceQty)
                
              }
              if (oldInvoiceDetail.pieceQty > invoiceDetail.pieceQty) {

                let pieceQty = oldInvoiceDetail.pieceQty - invoiceDetail.pieceQty;
                  
                await decreaseSoldQtyStockDetails(stockDetails,pieceQty);
               
              } else if (oldInvoiceDetail.pieceQty <= invoiceDetail.pieceQty) {
                  
                let pieceQty = invoiceDetail.pieceQty - oldInvoiceDetail.pieceQty;

                await increaseSoldQtyStockDetails(stockDetails,pieceQty)};
                
                await InvoiceDetails.findOneAndUpdate({ _id: invoiceDetail._id }, invoiceDetail);
              
              } else {
                
                let pieceQty = invoiceDetail.pieceQty;
                
                await increaseSoldQtyStockDetails(stockDetails,pieceQty)
                
                invoiceDetail['invoiceId'] = invoice._id;
                
                await InvoiceDetails(invoiceDetail).save()
              }
              
              await historyController.addHistory(invoiceDetail.history,payload,'stock','updateInvoiceDetail',req.body.invoiceDetails.length - i)
            
            })
          )
          await historyController.addHistory(invoiceHistory,payload,'invoice','update',0)
          
          return res.status(200).send({ message: 'invoice updated' })

        } catch (err) {
      
        return res.status(500).json(errorHandler(err))
      
      }
  })
}

async function decreaseSoldQtyStockDetails (stockDetails, pieceQty) {
  
  stockDetails.sort(function (a, b) {return new Date(a.date) - new Date(b.date)}).reverse();
  
   Promise.all(
    stockDetails.map(async (obj, index) => {
      if (pieceQty != 0 && obj.soldQty > 0) {
        
        if (obj.soldQty < pieceQty) {
        
          obj.actualQty += obj.soldQty;
          pieceQty -= obj.soldQty;
          obj.soldQty = 0;
        
        } else if (obj.soldQty > pieceQty) {
        
          obj.actualQty += pieceQty;
          obj.soldQty -= pieceQty;
          pieceQty = 0;
        
        } else if (obj.actualQty == pieceQty) {
        
          obj.soldQty = 0;
          obj.actualQty += pieceQty;
          pieceQty = 0;
        
        }
        
        stockDetails[index] = obj;
        
        await StockDetails.updateOne({ _id: obj.id },{ $set: { actualQty: obj.actualQty, soldQty: obj.soldQty } });
      }
    })
  ).then(() => {
    
    return true
  
  })
}

async function increaseSoldQtyStockDetails (stockDetails, pieceQty) {
  
  stockDetails.sort(function (a, b) {return new Date(a.date) - new Date(b.date)})
  
  Promise.all(
    
    stockDetails.map(async (obj, index) => {

      if (pieceQty != 0 && obj.actualQty > 0) {
       
        if (obj.actualQty < pieceQty) {
        
          pieceQty -= obj.actualQty;
          obj.soldQty += obj.actualQty;
          obj.actualQty = 0;
        
        } else if (obj.actualQty > pieceQty) {
        
          obj.actualQty -= pieceQty;
          obj.soldQty += pieceQty;
          pieceQty = 0;
        
        } else if (obj.actualQty == pieceQty) {
        
          obj.actualQty = 0;
          obj.soldQty += pieceQty;
          pieceQty = 0;
        
        }
        
        stockDetails[index] = obj;
        
        await StockDetails.updateOne({ _id: obj.id },{ $set: { actualQty: obj.actualQty, soldQty: obj.soldQty } });
      }
    })
  ).then(() => {
    return true
  })
}

module.exports.deleteInvoiceDetails = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      await InvoiceDetails.findByIdAndUpdate({ _id: req.params.id, status: true },{ $set: { status: false } });

      let invoiceDetails = await  InvoiceDetails.findById({ _id: req.params.id })

      if(!invoiceDetails) return res.status(404).send({message:'Invoice detail not found'})

      return  res.status(200).send(invoiceDetails)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.modelColorWiseSale = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if (err) return res.send(401).send({ message: 'not authentic user' })
      
      let invoiceDetails =  await InvoiceDetails.find({ status: true },{ modelNumber: 1, color: 1, rate: 1, totalCost: 1 , afterDiscount:1 , avgCost:1,discount:1}).populate('itemId', 'name').populate('brandId', 'brandName').populate({path: 'invoiceId',select: 'invoiceNo totalQty date',match:{ status: true , returnStatus:false },populate: { path: 'customerId', select: 'companyName' }}).lean()

      if (!invoiceDetails.length) return res.status(404).send({ message: 'invoice details not found' })

      let filterArray = invoiceDetails.filter(obj =>{return obj.invoiceId !== null});

      await Promise.all(
        filterArray.map(async (detail,i) =>{
          
          let returnInvoiceDetail = await ReturnInvoice.find({invoiceDetailId:detail._id});
          
          let returnQty = returnInvoiceDetail.reduce((acc,cu)=>{return acc + cu.totalReturnQty},0);
          
          let totalCost = returnInvoiceDetail.reduce((acc,cu)=>{return acc + (cu.totalReturnQty * cu.rate)},0);
          
          let afterDiscount = returnInvoiceDetail.reduce((acc,cu)=>{return acc + cu.returnAmmount},0);
          
          if(returnInvoiceDetail.length && detail._id.toString() == returnInvoiceDetail[0].invoiceDetailId.toString() ){
          
            filterArray[i].invoiceId.totalQty = filterArray[i].invoiceId.totalQty  - returnQty;
          
            filterArray[i].totalCost = filterArray[i].totalCost - totalCost ;
          
            filterArray[i].afterDiscount = filterArray[i].afterDiscount - afterDiscount;
          
          }
        })
      )

      await Promise.all(
       
        filterArray.map((invoiceDetail, i) => {
      
          filterArray[i]['itemName'] = invoiceDetail.itemId.name
      
          filterArray[i]['brandName'] = invoiceDetail.brandId.brandName
      
          filterArray[i]['invoiceNo'] = invoiceDetail.invoiceId.invoiceNo
      
          filterArray[i]['totalQty'] = invoiceDetail.invoiceId.totalQty
      
          filterArray[i]['date'] = invoiceDetail.invoiceId.date
      
          filterArray[i]['companyName'] = invoiceDetail.invoiceId.customerId.companyName
      
          delete filterArray[i]['itemId']
      
          delete filterArray[i]['brandId']
      
          delete filterArray[i].invoiceId
        })
      )

      return res.status(200).send(filterArray)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}


module.exports.addDamageSaleInvoiceDetailsWithInvoice = async (req,res) =>{
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
      try {
        
        if (err) return res.send(401).send({ message: 'not authentic user' })
        
        let invoiceDetailsArray, invoiceVar

        req.body.invoice['_id'] = new mongoose.Types.ObjectId()
        
        let invoiceHistory = req.body.invoice.history

        delete req.body.invoice['history']

        let result = await Invoice(req.body.invoice).save();
 
        invoiceVar = result;
        
        await addLedgerReport(result);
        
        req.body.invoiceDetails.map((x, i) => {
         
          historyController.addHistory(x.history,payload,'invoice','addInvoiceDetail',req.body.invoiceDetails.length - i);
         
          x['invoiceId'] = req.body.invoice._id;
        
        })
        
        Promise.all(
          req.body.invoiceDetails.map(async detail => {
            
            let stockDetails = await StockDetails.find({itemId: detail.itemId,brandId: detail.brandId,modelNumber: detail.modelNumber,color: detail.color,damageQty:{$gte:1}},{ actualQty: 1, soldQty: 1, date: 1,damageQty:1 });
                
            stockDetails.sort(function (a, b) {return new Date(a.date) - new Date(b.date)});
                
            let pieceQty = detail.pieceQty;
                
            Promise.all(
              stockDetails.map(async (obj, index) => {
                   
                if (pieceQty != 0 && obj.damageQty > 0) {
                
                  if (obj.damageQty < pieceQty) {
                
                    pieceQty -= obj.damageQty;
                    obj.soldQty += obj.damageQty;
                    obj.damageQty = 0;
                 
                  } else if (obj.damageQty > pieceQty) {
                 
                    obj.damageQty -= pieceQty;
                    obj.soldQty += pieceQty;
                    damageQty = 0;
                  
                  } else if (obj.damageQty == pieceQty) {
                  
                    obj.damageQty = 0;
                    obj.soldQty += pieceQty;
                    pieceQty = 0;

                  }
                  
                  stockDetails[index] = obj;
                  
                  await StockDetails.updateOne({ _id: obj.id },{$set: {damageQty: obj.damageQty,soldQty: obj.soldQty}});
                    
                }
 
              })
            )
          })
        )
        const promise = InvoiceDetails.insertMany(req.body.invoiceDetails).then(data => {
                 
          historyController.addHistory(invoiceHistory,payload,'invoice','add',0);
                 
          invoiceDetailsArray = data;
                
          })
          .catch(err => {
          
            return res.status(500).json(errorHandler(err))
          
          })
              
          Promise.all([promise]).then(() => {
                
            return res.status(200).send({invoice: invoiceVar,invoiceDetails: invoiceDetailsArray})
                
          })
          .catch(err => {
            
            return res.status(500).json(errorHandler(err))
            
          })
      } catch (err) {
        res.status(500).json(errorHandler(err))
      }
  })
}