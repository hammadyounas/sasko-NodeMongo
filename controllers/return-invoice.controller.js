const ReturnInvoice = require('../models/return-invoice.model');
const errorHandler = require('../utils/errorHandler');
const sixDigits = require('../utils/sixDigits');
const InvoiceDetails = require('../models/invoice-details.model');
const StockDetails = require('../models/stock-details.model');

module.exports.getReturnInvoice = (req, res) => {
    ReturnInvoice.find({ status: true }).then(invoices => {
            res.status(200).send(invoices);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.getReturnInvoiceId = (req,res)=>{
    ReturnInvoice.count().then(length =>{
        let id = sixDigits((length+1).toString())
        res.status(200).send({invoiceId:id});
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
}

module.exports.setReturnInvoice = async (req,res)=>{
    try{
        let invoiceDetail = await InvoiceDetails.findOne({_id:req.body.invoiceDetailId});
        if(invoiceDetail.pieceQty <= req.body.totalReturnQty){
            res.status(400).send({msg:'return quantity can not be greater then selling quantity'});
        }else{
            let stockDetails = await StockDetails.find({itemId:req.body.itemId,brandId:req.body.brandId,modelNumber:req.body.modelNumber,color:req.body.color});
            
        }
    }catch (err) {
        res.status(500).json(errorHandler(err))
      }
}