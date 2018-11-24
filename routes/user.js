'use strict'

var express = require('express');
var UserController= require('../controllers/user');
var api= express.Router();
var middleware = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir:'./uploads/users'});
api.get('/home',UserController.home);
api.get('/prueba',middleware.ensureAuth,UserController.prueba);
api.post('/register',UserController.saveUser);
api.post('/login',UserController.loginUser);
api.get('/user/:id', middleware.ensureAuth, UserController.getUser);
api.get('/users/:page?', middleware.ensureAuth, UserController.getUsers);
api.get('/counters/:id?',middleware.ensureAuth,UserController.getCounters);
api.put('/update-user/:id', middleware.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [middleware.ensureAuth,md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile',UserController.getImageFile);
module.exports=api;