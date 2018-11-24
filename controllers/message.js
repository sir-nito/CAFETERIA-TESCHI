'use strict'
var moment = require('moment');
var mongoosePaginate= require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

function prueba(req,res){
    res.status(200).send({messsage:'hola ella no me ama'});
}
function saveMessage(req,res){
    var params = req.body;
    
    if(!params.text || !params.receiver) return res.status(200).send({message:'hola envia'});
    
    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';
    message.save((err, MessageStored)=>{
        if(err) return res.status(500).send({message:'erro en peticion'});
        
        if(!MessageStored) return res.status(500).send({message:'error al enviar el mensaje'});
        
        res.status(200).send({message:MessageStored});
    });
    
}

function getReceivedMessages(req,res){
    var userId = req.user.sub;
    
    var page=1
    if(req.params.page){
       page = req.params.page;
       }
    var itemsPerPage=4;
    
    Message.find({receiver:userId}).populate('emitter','name surname nick image _id').paginate(page,itemsPerPage,(err,messages,total)=>{
        if(err) return res.status(500).send({message:'error en la peticion'});
        
        if(!messages) return res.status(500).send({message:'no hay mensajes'});
        
        return res.status(200).send({
            total:total,
            pages:Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

function getEmmitMessages(req,res){
    var userId = req.user.sub;
    
    var page=1
    if(req.params.page){
       page = req.params.page;
       }
    var itemsPerPage=4;
    
    Message.find({emitter:userId}).populate('emitter receiver','name surname nick image _id').paginate(page,itemsPerPage,(err,messages,total)=>{
        if(err) return res.status(500).send({message:'error en la peticion'});
        
        if(!messages) return res.status(500).send({message:'no hay mensajes'});
        
        return res.status(200).send({
            total:total,
            pages:Math.ceil(total/itemsPerPage),
            messages
        });
    });
}

function getUnviewedMessages(){
    var userId = req.user.sub;
    
    Message.count({receiver:userId,viewed:'false'}).exec((err,count)=>{
        if(err) return res.status(500).send({message:'error en la peticion'});
        
        return res.status(200).send({
           'unviewed':count 
        });
    });
}

function setViewedMessages(req,res){
    var userId = req.user.sub;
    
    Message.count({receiver:userId, viewed:'false'},{viewed:'true'},{'multi':true}).exec((err,messagesUpdated)=>{
        if(err) return res.status(500).send({message:'error en la peticion'});
        
        return res.status(200).send({
           messages:messagesUpdated 
        });
    });
}
module.exports = {
    prueba,
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages
}