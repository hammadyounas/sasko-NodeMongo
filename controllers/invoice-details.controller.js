const mongoose = require('mongoose');
const Invoice = require('../models/invoice.model');
const InvoiceDetails = require('../models/invoice-details.model');
const errorHandler = require('../utils/errorHandler');

module.exports.getInvoiceDetails = (req, res) => {
    InvoiceDetails.find({ status: true }).then(invoiceDetails => {
        res.status(200).send(invoiceDetails);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

// module.exports.setInvoiceDetails = (req, res) => {
//     InvoiceDetails.create(req.body).then(invoiceDetails => {
//         res.status(200).send(invoiceDetails);
//     }).catch(err => {
//         res.status(500).json(errorHandler(err));
//     });
// };

module.exports.addInvoiceDetailsWithInvoice = (req, res) => {
    try {
        let invoiceDetailsArray, invoiceVar;
        req.body.invoice['_id'] = new mongoose.Types.ObjectId();
        const invoice = new Invoice(req.body.invoice);
        invoice.save().then(result => {
            if (!result) {
                return error;
            } else {
                invoiceVar = result;
                req.body.invoiceDetails.map(x => (x['invoice'] = invoice._id));
                const promise = InvoiceDetails.insertMany(req.body.invoiceDetails).then(data => {
                    invoiceDetailsArray = data;
                });
                Promise.all([promise]).then(() => {
                    res.status(200).send({ invoice: invoiceVar, invoiceDetails: invoiceDetailsArray });
                });
            }
        });
    } catch (err) {
        res.status(500).json(errorHandler(err));
    }
}

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
