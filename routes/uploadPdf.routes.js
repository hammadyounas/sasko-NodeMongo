const express = require('express');

const routes = express.Router();
console.log("upload Route Loaded");

const UploadPdfController = require('../controllers/uploadPdf.controller')
// const PettyCashController = require('../controllers/petty-cash.controller');

// routes.get('/getPettyCashTransactionId',PettyCashController.getPettyCashTransactionId);
routes.get('/', UploadPdfController.getUploadPdf);

// routes.get('/:id', PettyCashController.getPettyCashById);
routes.post('/',UploadPdfController.setUploadPdf );
// routes.put('/', PettyCashController.updatePettyCash);
// routes.delete('/:id', PettyCashController.deletePettyCash);

module.exports = routes;
