const Invoice = require('../models/invoice.model');

module.exports.getInvoice = (req, res) => {
    Invoice.find({ status: true }).then(invoices => {
        res.status(200).send(invoices)
    }).catch(err => {
        res.status(500).send({ msg: 'internal server error' });
    });
};

module.exports.setInvoice = (req, res) => {
    Invoice.create(req.body).then(invoice => {
        res.status(200).send(invoice);
    }).catch(err => {
        res.status(500).send({ msg: 'internal server error' });
    });
};

module.exports.editInvoice = (req, res) => {
    Invoice.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body).then(() => {
        Invoice.findById({ _id: req.body._id }).then(invoice => {
            res.status(200).send(invoice);
        });
    }).catch(err => {
        res.status(500).send({ msg: 'internal server error' });
    });
};

module.exports.deleteInvoice = (req, res) => {
    Invoice.findByIdAndUpdate({ _id: req.params.id, status: true }, { $set: { status: false } }).then(() => {
        Invoice.findById({ _id: req.params.id }).then(invoice => {
            res.status(200).send(invoice);
        });
    }).catch(err => {
        res.status(500).send({ msg: 'internal server error' });
    });
};
