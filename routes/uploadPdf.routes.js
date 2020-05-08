const express = require('express');
const routes = express.Router();
const UploadPdfController = require('../controllers/uploadPdf.controller')

routes.get('/', UploadPdfController.getUploadPdf);
routes.post('/',UploadPdfController.setUploadPdf );

module.exports = routes;
