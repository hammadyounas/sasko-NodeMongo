const UploadPdf = require('../models/uploadPdf.model')
const cloudinary = require('cloudinary')
const historyController = require('./history.controller')
const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler')


cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
})

module.exports.setUploadPdf = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
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
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{
      
      if(err) return res.send(401).send({ message: 'not authentic user' })

      let pdfFiles = await UploadPdf.find();

      if (!pdfFiles.length) return res.status(404).send({ msg: 'Pdf list not found' })

      return res.status(200).send(pdfFiles)

    }catch(err){
      res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.deleteUploadedPdf = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
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
