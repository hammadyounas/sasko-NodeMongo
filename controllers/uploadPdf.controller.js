const mongoose = require('mongoose')
const UploadPdf = require('../models/uploadPdf.model')
const cloudinary = require('cloudinary');

let errorHandler = error => {
    return {
        stack: error.stack,
        code: error.code,
        message: error.message
    }
}
cloudinary.config({
    cloud_name: 'techon',
    api_key: '527597425984315',
    api_secret: 'X4RWf4qfZ-BHhz9UDNQac3hT6vM'
});
// module.exports.getPettyCashTransactionId = (req, res) => {
//   PettyCash.count()
//     .then(length => {
//       let id = sixDigits((length + 1).toString())
//       res.status(200).send({ pettyCashTransactionId: id })
//     })
//     .catch(err => {
//       res.status(500).json(errorHandler(err))
//     })
// }

module.exports.setUploadPdf = (req, res) => {
    UploadPdf.create(req.body)
        .then(pdf => {
            res.status(200).send(pdf)
        })
        .catch(err => {
            res.status(500).json(errorHandler(err))
        })
}

module.exports.getUploadPdf = (req, res) => {
    UploadPdf.find()
        .then(pdfFiles => {
            if (pdfFiles.length > 0) {
                res.status(200).send(pdfFiles)
            } else {
                res.status(404).send({ msg: 'No Data Found' })
            }
        })
        .catch(err => {
            res.status(500).json(errorHandler(err))
        })
}

// module.exports.getPettyCashById = (req, res) => {
//     PettyCash.findOne({ _id: req.params.id })
//         .then(result => {
//             res.status(200).send(result)
//         })
//         .catch(err => {
//             res.status(500).json(errorHandler(err))
//         })
// }

// module.exports.updatePettyCash = (req, res) => {
//     PettyCash.findOne({
//         date: req.body.date,
//         pettyCashName: req.body.pettyCashName,
//         cash: req.body.cash
//     }).then(response => {
//         if (!response) {
//             PettyCash.findByIdAndUpdate({ _id: req.body._id }, req.body)
//                 .then(() => {
//                     PettyCash.findById({ _id: req.body._id })
//                         .then(updatePettyCash => {
//                             res.status(200).send(updatePettyCash)
//                         })
//                         .catch(err => {
//                             res.status(500).json(errorHandler(err))
//                         })
//                 })
//                 .catch(err => {
//                     res.status(500).json(errorHandler(err))
//                 })
//         } else {
//             res
//                 .status(409)
//                 .send({ msg: 'this data is already exist on another petty cash' })
//         }
//     })
// }

module.exports.deleteUploadedPdf = (req, res) => {
    UploadPdf.findByIdAndRemove({ _id: req.params.id })
        .then(resp => {
            res.status(200).send(resp)
            if (res.status(200)) {
                cloudinary.v2.uploader.destroy(_id, function (error, result) {
                    console.log(result, error)
                });
            }
        })
        .catch(err => {
            res.status(500).json(errorHandler(err))
        })
}
