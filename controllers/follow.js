'use strict'


//var path = require('path');
//var fs = require('fs');
var mongoosePaginate= require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function saveFollow(req,res){
    
    var params = req.body;
   
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;
    
    follow.save((err, followStored)=>{
       if(err) return res.status(500).send({message:'error al guardar el seguimiento'});
        
        if(!followStored) return res.status(404).send({message:'el seguimiento no se ha guardado'});
      
        return res.status(200).send({follow:followStored});
    });
}

function deleteFollow(req,res){
    var userId = req.user.sub;
    var followId= req.params.id;
    
    Follow.find({'user':userId,'followed':followId}).remove((err)=>{
        if(err) return res.status(500).send({message:'error al dejar de seguir'});
        return res.status(200).send({message:'el follow se ha eliminado'});
    }); 
}

function getFollowingUsers(req,res){
    var userId = req.user.sub;
    if(req.params.id && req.params.page){
        userId = req.params.id;
    }
    
    var page=1;
    
    if(req.params.page){
        page = req.params.page;
    }
    
    var itemsPerPage= 4;
    
    Follow.find({user:userId}).populate({path:'followed'}).paginate(page,itemsPerPage,(err,follows,total)=>{
        if(err) return res.status(500).send({message:'error en el servidor en caso de que no lleguen los follows'});
        
        if(!follows) return res.status(404).send({message:'no estas siguiendo a algun usuario'});
            
        return res.status(200).send({
           total:total,
            pages:Math.ceil(total/itemsPerPage),
            follows
        });
    });
    
    
}

function getFollowedUsers(req,res){
      var userId = req.user.sub;
    if(req.params.id && req.params.page){
        userId = req.params.id;
    }
    
    var page=1;
    
    if(req.params.page){
        page = req.params.page;
    }
    
    var itemsPerPage= 4;
    
    Follow.find({followed:userId}).populate('user').paginate(page,itemsPerPage,(err,follows,total)=>{
        if(err) return res.status(500).send({message:'error en el servidor en caso de que no llguen los follows'});
        
        if(!follows) return res.status(404).send({message:'no te siguiendo a algun usuario'});
            
        return res.status(200).send({
           total:total,
            pages:Math.ceil(total/itemsPerPage),
            follows
        });
    });
    
}
//retornar listado de usuarios
function getMyFollows(req,res){
    var userId = req.user.sub;
   
    
    var find = Follow.find({user:userId});
    if(req.params.followed){
        find = Follow.find({followed:userId});
    }
    
    Follow.find({user:userId}).populate('user followed').exec((err,follows)=>{
       if(err) return res.status(500).send({message:'error en el servidor en caso de que no llguen los follows'});
        
        if(!follows) return res.status(404).send({message:'no te siguiendo a algun usuario'});
        
        return res.status(200).send({follows});
    
});
                                                              }
module.exports={
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
                                                              
}