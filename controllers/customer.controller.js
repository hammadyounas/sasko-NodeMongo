const Customer = require('../models/customer.model');
const errorHandler = require('../utils/errorHandler');

module.exports.getCustomer = (req, res) => {
    Customer.find({ status: true }).then(customers => {
        res.status(200).send(customers)
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.setCustomer = (req, res) => {
    Customer.create(req.body).then(customer => {
        res.status(200).send(customer);
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.editCustomer = (req, res) => {
    Customer.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body).then(() => {
        Customer.findById({ _id: req.body._id }).then(customer => {
            res.status(200).send(customer);
        }).catch(err => {
            res.status(500).json(errorHandler(err));
        });
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};

module.exports.deleteCustomer = (req, res) => {
    Customer.findByIdAndUpdate({ _id: req.params.id, status: true }, { $set: { status: false } }).then(() => {
        Customer.findById({ _id: req.params.id }).then(customer => {
            res.status(200).send(customer);
        }).catch(err => {
            res.status(500).json(errorHandler(err));
        });
    }).catch(err => {
        res.status(500).json(errorHandler(err));
    });
};
