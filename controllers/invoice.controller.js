const Invoice = require('../models/invoice.model')
const InvoiceDetails = require('../models/invoice-details.model')
const ReturnInvoice = require('../models/return-invoice.model');
const Customer = require('../models/customer.model')
const errorHandler = require('../utils/errorHandler')
const sixDigits = require('../utils/sixDigits')
const jwt = require('jsonwebtoken')

module.exports.getInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try{

        let invoices = await Invoice.find({ status: true , returnStatus:false},{status:0,returnStatus:0}).populate('customerId', 'companyName').lean().exec();

        if(!invoices.length) return res.status(404).send({ message: 'Invoices data not found' });

        await Promise.all(
          invoices.map((invoice,i) =>{
              invoices[i]['companyName'] = invoice.customerId.companyName;
              invoices[i]['customerId'] = invoice.customerId._id;
          })
        )

        return res.status(200).send(invoices);

      }catch(err){
        return res.status(500).send(err)
      }
    }
  })
}

module.exports.getSummeryDetails = async (req,res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      return res.send(401).send({ message: 'not authentic user' })
    } else {
      let detailQuery = {};
      let invoiceQuery = {};
      let matchQuery = {}
      
      req.body.itemId ? (detailQuery['itemId'] = req.body.itemId ) : "";
      req.body.brandId ? (detailQuery['brandId'] = req.body.brandId ) : "";
      req.body.modelNumber ? (detailQuery['modelNumber'] = req.body.modelNumber ) : "";
      req.body.color ? (detailQuery['color'] = req.body.color ) : "";
      
      req.body.fromDate ? (invoiceQuery['date'] = {$gte:new Date(req.body.fromDate)}) : "";
      req.body.toDate ? (invoiceQuery['date'] = {$gte:new Date(req.body.toDate)}) : "";
      req.body.fromDate && req.body.toDate ? (invoiceQuery['date'] = {$gte:new Date(req.body.fromDate),$lte:new Date(req.body.toDate)} ) : "";
      req.body.customerId ? (invoiceQuery['customerId'] = req.body.customerId ) : "";
      req.body.invoiceNo ? (invoiceQuery['invoiceNo'] = req.body.invoiceNo ) : "";

      invoiceQuery['status'] = true;
      invoiceQuery['returnStatus'] = false;

      let invoices = await Invoice.find({ status: true ,returnStatus:false}).count();
      InvoiceDetails.find(detailQuery)
        .populate({
          path:'invoiceId',
          match:invoiceQuery
        }).lean()
        .then(async details => {
          let filterArray = details.filter(obj =>{return obj.invoiceId !== null});
          await Promise.all(
            filterArray.map(async (detail,i) =>{
              let returnInvoiceDetail = await ReturnInvoice.find({invoiceDetailId:detail._id});
              if(returnInvoiceDetail.length && detail._id.toString() == returnInvoiceDetail[0].invoiceDetailId.toString() ){
                let returnQty = returnInvoiceDetail.reduce((acc,cu)=>{return acc + cu.totalReturnQty},0);
                let totalCost = returnInvoiceDetail.reduce((acc,cu)=>{return acc + (cu.totalReturnQty * cu.rate)},0);
                let afterDiscount = returnInvoiceDetail.reduce((acc,cu)=>{return acc + cu.returnAmmount},0);
                 filterArray[i].pieceQty = filterArray[i].pieceQty  - returnQty;
                 filterArray[i].totalCost = filterArray[i].totalCost - totalCost ;
                 filterArray[i].afterDiscount = filterArray[i].afterDiscount - afterDiscount;
              }
            })
          )

          let obj = {
            invoices:invoices,
            cost: filterArray.reduce((acc, current) => {
              return acc + (current.avgCost * current.pieceQty)
            }, 0),
            totalPieces: filterArray.reduce((acc, current) => {
              return acc + current.pieceQty
            }, 0),
            sale: filterArray.reduce((acc, current) => {
              return acc + (current.rate * current.pieceQty)
            }, 0),
            netDiscount: filterArray.reduce((acc, current) => {
              return acc + (current.totalCost - current.afterDiscount)
            }, 0),
            netSale:
              filterArray.reduce((acc, current) => {
                return acc + current.totalCost
              }, 0) -
              filterArray.reduce((acc, current) => {
                return acc + (current.totalCost - current.afterDiscount)
              }, 0),
            profitLoss: filterArray.reduce((acc,current) =>{
              return acc + (current.afterDiscount - (current.avgCost * current.pieceQty))
            }, 0).toFixed(2) 
          }
          res.status(200).send(obj)
        }).catch(err =>{
          res.status(500).send(err);
        })
      }
    })
}

module.exports.getInvoiceId = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.count()
        .then(length => {
          let id = sixDigits((length + 1).toString())
          res.status(200).send({ invoiceId: id })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getInvoiceById = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.findById({ _id: req.params.id, status: true,returnStatus:false })
        .then(invoice => {
          res.status(200).send(invoice)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getInvoiceWithInvoiceDetails = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      try {
        let invoice = await Invoice.findOne({ _id: req.params.id,status:true,returnStatus:false }).populate('customerId','companyName').lean();
        
        if(!invoice) return res.status(404).send({message:'Invoice not found'});

        invoice['companyName'] = invoice.customerId.companyName;
        invoice['customerId'] = invoice.customerId._id;

        let invoiceDetails = await InvoiceDetails.find({
          invoiceId: req.params.id
        })
          .populate('itemId', 'name')
          .populate('brandId', 'brandName')

        if(!invoiceDetails) return res.status(404).send({message:'Details not found'});

        invoice['totalAmmount'] = invoiceDetails.reduce((acc,cu)=>{return acc + cu.totalCost},0) ;
        invoice['profitLoss'] = invoiceDetails.reduce((acc,current) =>{
          return acc + (current.afterDiscount - (current.avgCost * current.pieceQty))
        }, 0).toFixed(2) 

        let obj = { invoice, invoiceDetails }
        res.status(200).send(obj)
      } catch (err) {
        res.status(500).send(errorHandler(err))
      }
    }
  })
}

module.exports.setInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.create(req.body)
        .then(invoice => {
          res.status(200).send(invoice)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.editInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body)
        .then(() => {
          Invoice.findById({ _id: req.body._id })
            .then(invoice => {
              res.status(200).send(invoice)
            })
            .catch(err => {
              res.status(500).json(errorHandler(err))
            })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.deleteInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      Invoice.findByIdAndUpdate(
        { _id: req.params.id, status: true },
        { $set: { status: false } }
      )
        .then(() => {
          Invoice.findById({ _id: req.params.id })
            .then(invoice => {
              res.status(200).send(invoice)
            })
            .catch(err => {
              res.status(500).json(errorHandler(err))
            })
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getCustomers = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{
      
      if(err) return res.status(401).send({ message: 'not authentic user' })

      let customers = await Customer.find({}, { _id: 1, clientName: 1 })

      if(!customers) return res.status(404).send({ message: 'No Customers Found' })

      return res.status(200).send(customers)

    }catch(err){
      res.status(500).json(errorHandler(err))
    }
  })
}
