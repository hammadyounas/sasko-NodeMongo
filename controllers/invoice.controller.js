const Invoice = require('../models/invoice.model')
const InvoiceDetails = require('../models/invoice-details.model')
const ReturnInvoice = require('../models/return-invoice.model');
const Customer = require('../models/customer.model')
const errorHandler = require('../utils/errorHandler')
const sixDigits = require('../utils/sixDigits')
const jwt = require('jsonwebtoken')

function buildReportFilters(body) {
  const detailQuery = {}
  const invoiceQuery = {}
  if (body.itemId) detailQuery.itemId = body.itemId
  if (body.brandId) detailQuery.brandId = body.brandId
  if (body.modelNumber) detailQuery.modelNumber = body.modelNumber
  if (body.color) detailQuery.color = body.color
  if (body.fromDate) invoiceQuery.date = { $gte: new Date(body.fromDate) }
  if (body.toDate) invoiceQuery.date = { $gte: new Date(body.toDate) }
  if (body.fromDate && body.toDate) {
    invoiceQuery.date = { $gte: new Date(body.fromDate), $lte: new Date(body.toDate) }
  }
  if (body.customerId) invoiceQuery.customerId = body.customerId
  if (body.invoiceNo) invoiceQuery.invoiceNo = body.invoiceNo
  if (body.manualBookNo) invoiceQuery.manualBookNo = body.manualBookNo
  invoiceQuery.status = true
  invoiceQuery.returnStatus = false
  if (body.postedOnly === true) invoiceQuery.postedStatus = true
  const hasDetailFilters = !!(body.itemId || body.brandId || body.modelNumber || body.color)
  return { detailQuery, invoiceQuery, hasDetailFilters }
}

async function enrichInvoicesWithBuyCost(invoices) {
  await Promise.all(
    invoices.map(async (invoice, i) => {
      const invoiceDetails = await InvoiceDetails.find({ invoiceId: invoice._id })
        .populate('itemId', 'name')
        .populate('brandId', 'brandName')
        .lean()
        .exec()
      const cost = invoiceDetails.reduce((acc, cur) => acc + cur.avgCost * cur.pieceQty, 0)
      invoices[i].buyCost = cost
      if (invoice.customerId && invoice.customerId.companyName) {
        invoices[i].companyName = invoice.customerId.companyName
        invoices[i].customerId = invoice.customerId._id
      }
    })
  )
}

module.exports.getInvoiceReportPage = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err, payload) {
    try {
      if (err) return res.status(401).send({ message: 'not authentic user' })
      const body = req.body || {}
      const page = Math.max(1, parseInt(body.page, 10) || 1)
      const rawLimit = parseInt(body.pageSize, 10) || 25
      const pageSize = Math.min(200, Math.max(1, rawLimit))
      const skip = (page - 1) * pageSize
      const { detailQuery, invoiceQuery, hasDetailFilters } = buildReportFilters(body)

      let invoices = []
      let total = 0

      if (!hasDetailFilters) {
        total = await Invoice.countDocuments(invoiceQuery)
        invoices = await Invoice.find(invoiceQuery)
          .select({ status: 0, returnStatus: 0 })
          .populate('customerId', 'companyName')
          .sort({ date: -1, createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean()
          .exec()
      } else {
        const details = await InvoiceDetails.find(detailQuery)
          .populate({ path: 'invoiceId', match: invoiceQuery })
          .lean()
        const seen = new Map()
        for (const d of details) {
          if (d.invoiceId && d.invoiceId._id) {
            const idStr = d.invoiceId._id.toString()
            if (!seen.has(idStr)) seen.set(idStr, d.invoiceId)
          }
        }
        const invList = Array.from(seen.values())
        invList.sort((a, b) => {
          const da = new Date(a.date || a.createdAt || 0).getTime()
          const db = new Date(b.date || b.createdAt || 0).getTime()
          return db - da
        })
        total = invList.length
        const pageSlice = invList.slice(skip, skip + pageSize)
        const ids = pageSlice.map((inv) => inv._id)
        if (ids.length) {
          invoices = await Invoice.find({ _id: { $in: ids } })
            .select({ status: 0, returnStatus: 0 })
            .populate('customerId', 'companyName')
            .lean()
          const order = new Map(ids.map((id, idx) => [id.toString(), idx]))
          invoices.sort((a, b) => order.get(a._id.toString()) - order.get(b._id.toString()))
        }
      }

      await enrichInvoicesWithBuyCost(invoices)
      return res.status(200).send({ data: invoices, total, page, pageSize })
    } catch (err) {
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.getInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
      try{

        if (err) return res.send(401).send({ message: 'not authentic user' })

        let invoices = await Invoice.find({ status: true , returnStatus: false },  { status: 0, returnStatus: 0 }).populate('customerId', 'companyName').lean().exec();

        if (!invoices.length) return res.status(404).send({ message: 'Invoices data not found' });

        await Promise.all(
          invoices.map(async (invoice, i) => {
              const invoiceDetails = await InvoiceDetails.find({invoiceId: invoice._id}).populate('itemId', 'name').populate('brandId', 'brandName').lean().exec();
              
              const cost = invoiceDetails.reduce((acc, cur) => { return acc += (cur.avgCost * cur.pieceQty) }, 0);
              
              invoice['buyCost'] = cost;
              invoices[i]['companyName'] = invoice.customerId.companyName;
              invoices[i]['customerId'] = invoice.customerId._id;
          })
        )

        return res.status(200).send(invoices);

      }catch(err){
        return res.status(500).send(err)
      }
  })
}

module.exports.getSummeryDetails = async (req,res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    
    try{

    let detailQuery = {};
    
    let invoiceQuery = {};
          
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

    let details = await InvoiceDetails.find(detailQuery).populate({path:'invoiceId',match:invoiceQuery}).lean();

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
      
      cost: filterArray.reduce((acc, current) => {return acc + (current.avgCost * current.pieceQty)}, 0),
     
      totalPieces: filterArray.reduce((acc, current) => {return acc + current.pieceQty}, 0),
     
      sale: filterArray.reduce((acc, current) => {return acc + (current.rate * current.pieceQty)}, 0),
     
      netDiscount: filterArray.reduce((acc, current) => {return acc + (current.totalCost - current.afterDiscount) }, 0),
      
      netSale: filterArray.reduce((acc, current) => {return acc + current.totalCost}, 0) - filterArray.reduce((acc, current) => {return acc + (current.totalCost - current.afterDiscount)}, 0),
      
      profitLoss: filterArray.reduce((acc,current) =>{return acc + (current.afterDiscount - (current.avgCost * current.pieceQty))}, 0).toFixed(2) 
    
    }

    return res.status(200).send(obj)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.getInvoiceId = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let length = await  Invoice.count();
      
      let id = sixDigits((length + 1).toString());

      return res.status(200).send({ invoiceId: id });
      
    }catch(err){
      return res.status(500).json(errorHandler(err));
    }
  })
}

module.exports.getInvoiceById = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      let invoice = await Invoice.findById({ _id: req.params.id, status: true, returnStatus:false });

      return res.status(200).send(invoice);

    }catch(err){
      return res.status(500).json(errorHandler(err));
    }
  })
}

module.exports.getInvoiceWithInvoiceDetails = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {

    try {

      if(err) return res.send(401).send({ message: 'not authentic user' })

      let invoice = await Invoice.findOne({ _id: req.params.id,status:true,returnStatus:false }).populate('customerId','companyName').lean();
        
      if(!invoice) return res.status(404).send({message:'Invoice not found'});

      invoice['companyName'] = invoice.customerId.companyName;
      
      invoice['customerId'] = invoice.customerId._id;

      let invoiceDetails = await InvoiceDetails.find({invoiceId: req.params.id}).populate('itemId', 'name').populate('brandId', 'brandName')

      if(!invoiceDetails) return res.status(404).send({message:'Details not found'});

      invoice['totalAmmount'] = invoiceDetails.reduce((acc,cu)=>{return acc + cu.totalCost},0) ;
      
      invoice['profitLoss'] = invoiceDetails.reduce((acc,current) =>{return acc + (current.afterDiscount - (current.avgCost * current.pieceQty))}, 0).toFixed(2) 

      let obj = { invoice, invoiceDetails }
      
      return res.status(200).send(obj)
      
    } catch (err) {
      return  res.status(500).send(errorHandler(err))
    }
  })
}

module.exports.setInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{
      
      if(err) return res.send(401).send({ message: 'not authentic user' });

      let invoice = await Invoice.create(req.body);

      return res.status(200).send(invoice)

    }catch(err){
      return res.status(500).send(errorHandler(err))
    }
  })
}

module.exports.editInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      await  Invoice.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body);

      let invoice  = await Invoice.findById({ _id: req.body._id });

      if(!invoice) return res.status(404).send({message:"not invoice info found"});

      return res.status(200).send(invoice)

    }catch(err){
      return res.status(500).send(errorHandler(err))
    }
  })
}

module.exports.deleteInvoice = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{
      
      if(err) return res.send(401).send({ message: 'not authentic user' })

      let invoice = await Invoice.findByIdAndUpdate({ _id: req.params.id, status: true },{ $set: { status: false } });

      return res.status(404).send(invoice)
    
    }catch(err){
      return res.status(500).send(errorHandler(err))
    }
  })
}

module.exports.getCustomers = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
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
