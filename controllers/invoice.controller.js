const Invoice = require('../models/invoice.model');
const InvoiceDetails = require('../models/invoice-details.model');
const Customer = require('../models/customer.model');
const errorHandler = require('../utils/errorHandler');
const getInvoiceNumber = require('../utils/invoiceNumberGenerator');
const sixDigits = require('../utils/sixDigits')

module.exports.getInvoice = (req, res) => {
    Invoice.find({ status: true }).populate('customerId','clientName').then(invoices => {
            res.status(200).send(getInvoiceNumber(invoices));
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.getInvoiceId = (req,res)=>{
    Invoice.count().then(length =>{
        let id = sixDigits((length+1).toString())
        res.status(200).send({invoiceId:id});
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
}

module.exports.getInvoiceById = (req, res) => {
    Invoice.findById({ _id: req.params.id, status: true }).then(invoice => {
        res.status(200).send(invoice);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.getInvoiceWithInvoiceDetails = async (req, res) => {
    try {
      let invoice = await Invoice.findOne({ _id: req.params.id })
      let invoiceDetails = await InvoiceDetails.find({
        invoiceId: req.params.id
      }).populate('itemId', 'name').populate('brandId','brandName');
      let obj = {invoice,invoiceDetails};
        res.status(200).send(obj)
    } catch (err) {
      res.status(500).send(errorHandler(err))
    }
  }

module.exports.setInvoice = (req, res) => {
    Invoice.create(req.body).then(invoice => {
        res.status(200).send(invoice);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.editInvoice = (req, res) => {
    Invoice.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body).then(() => {
        Invoice.findById({ _id: req.body._id }).then(invoice => {
            res.status(200).send(invoice);
        }).catch(err => {
            res.status(500).json(errorHandler(err));
        });
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.deleteInvoice = (req, res) => {
    Invoice.findByIdAndUpdate({ _id: req.params.id, status: true }, { $set: { status: false } }).then(() => {
        Invoice.findById({ _id: req.params.id }).then(invoice => {
            res.status(200).send(invoice);
        }).catch(err => {
            res.status(500).json(errorHandler(err));
        });
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.getCustomers = (req, res) => {
    Customer.find({}, {_id: 1, clientName: 1}).then(customers => {
        res.status(200).send(customers);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};
