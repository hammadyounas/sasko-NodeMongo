const PaymentReceive = require('../models/payment-receive.model');
const errorHandler = require('../utils/errorHandler');

module.exports.getPaymentReceive = (req, res) => {
    PaymentReceive.find({ status: true }).then(payment_receives => {
        res.status(200).send(payment_receives)
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.setPaymentReceive = (req, res) => {
    PaymentReceive.create(req.body).then(payment_receive => {
        res.status(200).send(payment_receive);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.editPaymentReceive = (req, res) => {
    PaymentReceive.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body).then(() => {
        PaymentReceive.findById({ _id: req.body._id }).then(payment_receive => {
            res.status(200).send(payment_receive);
        }).catch(err => {
            res.status(500).json(errorHandler(err));
        });
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.deletePaymentReceive = (req, res) => {
    PaymentReceive.findByIdAndUpdate({ _id: req.params.id, status: true }, { $set: { status: false } }).then(() => {
        PaymentReceive.findById({ _id: req.params.id }).then(payment_receive => {
            res.status(200).send(payment_receive);
        }).catch(err => {
            res.status(500).json(errorHandler(err));
        });
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};
