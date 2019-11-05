const mongoose = require('mongoose')
const UploadPdf = require('../models/uploadPdf.model')
const cloudinary = require('cloudinary')

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
})
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
      if (!pdfFiles.length) {
        res.status(404).send({ msg: 'No Data Found' })
      } else {
        res.status(200).send(pdfFiles)
      }
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.deleteUploadedPdf = (req, res) => {
  UploadPdf.findByIdAndRemove({ _id: req.params.id })
    .then(resp => {
      res.status(200).send(resp)
      if (res.status(200)) {
        cloudinary.v2.uploader.destroy(_id, function (error, result) {
          console.log(result, error)
        })
      }
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}
