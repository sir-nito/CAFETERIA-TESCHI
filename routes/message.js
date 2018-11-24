'use strict'
var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var middleware = require('../middlewares/authenticated');

api.get('/probando-md',middleware.ensureAuth, MessageController.prueba);
api.post('/message',middleware.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?',middleware.ensureAuth, MessageController.getReceivedMessages);
api.get('/messages/:page?',middleware.ensureAuth, MessageController.getEmmitMessages);
api.get('/unviewed-messages',middleware.ensureAuth, MessageController.getUnviewedMessages);
api.get('/set-viewed-messages',middleware.ensureAuth, MessageController.setViewedMessages);
module.exports= api;