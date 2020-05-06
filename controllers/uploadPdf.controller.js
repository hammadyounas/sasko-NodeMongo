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
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' })

      let pdf = await UploadPdf.create(req.body);

      await historyController.addHistory(
        req.body.history,
        payload,
        'PDF',
        'add',
        0
      )

      return res.status(200).send(pdf)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.getUploadPdf = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    try{
      
      if(err) return res.send(401).send({ message: 'not authentic user' })

      let pdfFiles = await UploadPdf.find();

      if (!pdfFiles.length) return res.status(404).send({ msg: 'No Data Found' })

      return res.status(200).send(pdfFiles)

    }catch(err){
      res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.deleteUploadedPdf = (req, res) => {
  jwt.verify(req.query.token, 'secretOfSasscoTraders', async function (
    err,
    payload
  ) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' })

      let resp = await UploadPdf.findByIdAndRemove({ _id: req.params.id });

      if(resp) cloudinary.v2.uploader.destroy(_id, function (error, result) {})

      return res.status(200).send(resp)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}
