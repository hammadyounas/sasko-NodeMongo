const InvoiceDetails = require('../models/invoice-details.model');
const errorHandler = require('../utils/errorHandler');

module.exports.getInvoiceDetails = (req, res) => {
    InvoiceDetails.find({ status: true }).then(invoiceDetails => {
        res.status(200).send(invoiceDetails);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.setInvoiceDetails = (req, res) => {
    InvoiceDetails.create(req.body).then(invoiceDetails => {
        res.status(200).send(invoiceDetails);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.editInvoiceDetails = (req, res) => {
    InvoiceDetails.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body).then(() => {
        InvoiceDetails.findById({ _id: req.body._id }).then(invoiceDetails => {
            res.status(200).send(invoiceDetails);
        }).catch(err => {
            res.status(500).json(errorHandler(err));
        });
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.deleteInvoiceDetails = (req, res) => {
    InvoiceDetails.findByIdAndUpdate({ _id: req.params.id, status: true }, { $set: { status: false } }).then(() => {
        InvoiceDetails.findById({ _id: req.params.id }).then(invoiceDetails => {
            res.status(200).send(invoiceDetails);
        }).catch(err => {
            res.status(500).json(errorHandler(err));
        });
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};
