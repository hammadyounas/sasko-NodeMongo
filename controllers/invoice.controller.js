const Invoice = require('../models/invoice.model');
const Customer = require('../models/customer.model');
const errorHandler = require('../utils/errorHandler');
const getInvoiceNumber = require('../utils/invoiceNumberGenerator');

module.exports.getInvoice = (req, res) => {
    Invoice.find({ status: true }).then(invoices => {
            res.status(200).send(getInvoiceNumber(invoices));
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.getInvoiceById = (req, res) => {
    Invoice.findById({ _id: req.params.id, status: true }).then(invoice => {
        res.status(200).send(invoice);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

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
