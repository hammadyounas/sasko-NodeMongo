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
                }).catch(err => {
                    res.status(500).json(errorHandler(err));
                });
                Promise.all([promise]).then(() => {
                    res.status(200).send({ invoice: invoiceVar, invoiceDetails: invoiceDetailsArray });
                }).catch(err => {
                    res.status(500).json(errorHandler(err));
                })
            }
        });
    } catch (err) {
        res.status(500).json(errorHandler(err));
    }
}

module.exports.editInvoiceDetailsWithInvoice = async (req, res) => {
    try {
        let updatedArray = [];
        const invoice = await Invoice.findByIdAndUpdate({ _id: req.body.invoice._id }, req.body.invoice);
        Promise.all(
            req.body.invoiceDetails.map(async invoice => {
                const invoiceDetails = await InvoiceDetails.findByIdAndUpdate({ _id: invoice._id }, invoice);
            })).then(async () => {
                const newInvoice = await Invoice.findOne({ _id: req.body.invoice._id });
                Promise.all(
                    req.body.invoiceDetails.map(async invoice => {
                        const newInvoiceDetails = await InvoiceDetails.findOne({ _id: invoice._id });
                        updatedArray.push(newInvoiceDetails);
                    })
                ).then(() => {
                    res.status(200).send({ ...newInvoice._doc, updatedArray });
                });
            });
    } catch (err) {
        res.status(500).send(err.message);
    }
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
