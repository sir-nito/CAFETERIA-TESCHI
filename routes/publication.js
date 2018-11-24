'use strict'


var express = require('express');
var PublicationController = require('../controllers/publication');
var api = express.Router();
var middleware = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir:'./uploads/publications'});

api.get('/probando-pub',middleware.ensureAuth,PublicationController.probando);
api.post('/publication',middleware.ensureAuth,PublicationController.savePublication);
api.get('/publications/:page?',middleware.ensureAuth,PublicationController.getPublications);
api.get('/publication/:id',middleware.ensureAuth,PublicationController.getPublication);
api.delete('/publication/:id',middleware.ensureAuth,PublicationController.deletePublication);
api.post('/publication/:id',[middleware.ensureAuth,md_upload],PublicationController.uploadImage);
api.get('/get-image-pub/:imageFile',PublicationController.getImageFile);
module.exports=api;