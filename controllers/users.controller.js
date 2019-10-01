const mongoose = require('mongoose')
const UserInfo = require('../models/users.model')

let errorHandler = error => {
    return {
        stack: error.stack,
        code: error.code,
        message: error.message
    }
}

module.exports.setUser = (req, res) => {
    UserInfo.create(req.body)
        .then(user => {
            res.status(200).send(user)
        })
        .catch(err => {
            res.status(500).json(errorHandler(err))
        })
}

module.exports.getUser = (req, res) => {
    UserInfo.find()
        .then(user => {
            if (user.length > 0) {
                res.status(200).send(user)
            } else {
                res.status(404).send({ msg: 'No Data Found' })
            }
        })
        .catch(err => {
            res.status(500).json(errorHandler(err))
        })
}

// module.exports.deleteUploadedPdf = (req, res) => {
//     UserInfo.findByIdAndRemove({ _id: req.params.id })
//         .then(resp => {
//             res.status(200).send(resp)
//         })
//         .catch(err => {
//             res.status(500).json(errorHandler(err))
//         })
// }
