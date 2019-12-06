const mongoose = require('mongoose')
const UploadPdf = require('../models/uploadPdf.model')
const cloudinary = require('cloudinary')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')

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

module.exports.setUploadPdf = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      UploadPdf.create(req.body)
        .then(async pdf => {
          let record = await historyController.addHistory(
            req.body.history,
            payload,
            'PDF',
            'add',
            0
          )
          res.status(200).send(pdf)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getUploadPdf = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
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
  })
}

module.exports.deleteUploadedPdf = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    if (err) {
      res.send(401).send({ message: 'not authentic user' })
    } else {
      UploadPdf.findByIdAndRemove({ _id: req.params.id })
        .then(resp => {
          res.status(200).send(resp)
          if (res.status(200)) {
            cloudinary.v2.uploader.destroy(_id, function (error, result) {
            })
          }
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}
