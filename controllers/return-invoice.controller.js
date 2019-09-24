const ReturnInvoice = require('../models/return-invoice.model');
const errorHandler = require('../utils/errorHandler');
const sixDigits = require('../utils/sixDigits')

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

module.exports.setReturnInvoice = (req,res)=>{

}