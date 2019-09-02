const Customer = require('../models/customer.model');

module.exports.getCustomer = (req, res) => {
    Customer.find({ status: true }).then(customers => {
        res.status(200).send(customers)
    }).catch(err => {
        res.status(500).send({ msg: 'internal server error' });
    });
};

module.exports.setCustomer = (req, res) => {
    Customer.create(req.body).then(customer => {
        res.status(200).send(customer);
    }).catch(err => {
        res.status(500).send({ msg: 'internal server error' });
    });
};

module.exports.editCustomer = (req, res) => {
    Customer.findByIdAndUpdate({ _id: req.body._id, status: true }, req.body).then(() => {
        Customer.findById({ _id: req.body._id }).then(customer => {
            res.status(200).send(customer);
        });
    }).catch(err => {
        res.status(500).send({ msg: 'internal server error' });
    });
};

module.exports.deleteCustomer = (req, res) => {
    Customer.findByIdAndUpdate({ _id: req.params.id, status: true }, { $set: { status: false } }).then(() => {
        Customer.findById({ _id: req.params.id }).then(customer => {
            res.status(200).send(customer);
        });
    }).catch(err => {
        res.status(500).send({ msg: 'internal server error' });
    });
};
