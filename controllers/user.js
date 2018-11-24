'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate= require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User=require('../models/user');
var Follow=require('../models/follow');
var Publication= require('../models/publication');
var jwt = require('../services/jwt');


function home(req,res){
    res.status(200).send({
     message:'pruebas a sistema home'   
    });
}
function prueba(req,res){
      console.log(req.body);
      res.status(200).send({
          message:'acciones de prueba verificacion de models'
      });
    
}
    
function saveUser(req,res){
    var params = req.body;
    var user = new User();
    if(params.name && params.surname && params.nick && params.email && params.password){
        
        user.name = params.name;
        user.surname = params.surname;   
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;
        /////// conrolar a los usuarios replicados
        User.find({ $or:[
            {email:user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]}).exec((err,users)=>{
            if(err) return res.status(500).send({message:'error en la peticion'});
            if(users && users.length >=1){
               return res.status(200).send({message:'el usuaio existe dentro del sistema'});
               }else{
                    bcrypt.hash(params.password,null,null,(err,hash)=>{
            user.password= hash;
            user.save((err,userStored)=>{
                if(err) return res.status(500).send({message:'error al guardar el usuario por fabor revise datos'});
                if(userStored){
                    res.status(200).send({user: userStored});
                }else{
                    res.status(404).send({message:'no se ha registrado el usuario'});
                }
            });
        });
               }
        });
       
    }else {
        res.status(200).send({
            message: 'envia todos lo datos'
        });
    }

}

function loginUser(req,res){
    var params = req.body;
    var email = params.email;
    var password = params.password;
    
    User.findOne({email:email}, (err,user)=>{
       if(err) return res.status(500).send({message:'Error en la peticion'}) 
   
    if(user){
        bcrypt.compare(password,user.password,(err,check)=>{
           if(check){
               if(params.gettoken){
                   //devolver token2.0
                   //generar un token2.0
                   return res.status(200).send({
                      token:jwt.createToken(user)
                   });
               }else{
                    //regresar datos del usuario prueba 1.0
               user.password = undefined;
               return res.status(200).send({user});
               }
              
           } else{
               return res.status(404).send({message:'el usuario no se ha identificado correctamente'});
           }
        });
    }else {
        return res.status(404).send({message:'el usuario no se ha identificado coreectamente'});
    }
    });
}

//metodo para conseguir los datos de un usuario

function getUser(req,res){
    var userId = req.params.id;
    User.findById(userId,(err,user)=>{
        if(err) return res.status(500).send({message:'error en la peticion'});
        if(!user) return res.status(404).send({message:'el usuario no existe'});
       Follow.findOne({"user":req.user.sub,"followed":userId}).exec((err,follow)=>{
          followThisUser(req.user.sub,userId).then((value)=>{
              return res.status(200).send({
                  user,
                  following:value.following,
                  followed:value.followed
              });
          });
           
       });
        
        
    });
} 
//hacer que sea syncrona 
async function followThisUser(identity_user_id,user_id){
    var following = Follow.findOne({"user":identity_user_id,"followed":user_id}).exec((err,follow)=>{
       if(err) return handleError(err);
        return follow; 
    });
    var followed = Follow.findOne({"user":user_id,"followed":identity_user_id}).exec((err,follow)=>{
       if(err) return handleError(err);
        return follow;
    });
        //se devuelev un objeto con los datos
        return {
            following:following,
            followed:followed
        }
}
                                                                                     
//listado de usuarios paginados
function getUsers(req,res){
    var identity_user_id = req.user.sub;
    var page =1;
    if(req.params.page){
       page= req.params.page;
       }
    var itemsPerPage=5;
    User.find().sort('_id').paginate(page,itemsPerPage,(err,users,total)=>{
        if(err) return res.status(500).send({message:'error en la peticion'});
        
        if(!users) return res.status(404).send({message:'no hay usuarios disponibles'});
        followUserIds(identity_user_id).then((value)=>{
                return res.status(200).send({
            users,
            users_following:value.following,
            users_follow_me:value.followed,
            total,
            pages:Math.ceil(total/itemsPerPage)
       
        });
    });
});
}
                                     
async function followUserIds(identity_user_id, user_id){
    try {
        var following = await Follow.findOne({ user: identity_user_id, followed: user_id}).exec()
            .then((following) => {
                console.log(following);
                return following;
            })
            .catch((err)=>{
                return handleerror(err);
            });
        var followed = await Follow.findOne({ user: user_id, followed: identity_user_id}).exec()
            .then((followed) => {
                console.log(followed);
                return followed;
            })
            .catch((err)=>{
                return handleerror(err);
            });
        return {
            following: following,
            followed: followed
        }
    } catch(e){
        console.log(e);
    }
}

function getCounters(req,res){
    var userId= req.user.sub;
    if(req.params.id){  
        userId= req.params.id;
       } 
    getCountFollow(userId).then((value)=>{
            return res.status(200).send(value); 
         });
    
}

async function getCountFollow(user_id){
    var following = await Follow.count({"user":user_id}).estimatedDocumentCount((err, count) => {
        if(err) return handleError(err);
        return count;
    });
 
    var followed = await Follow.count({"followed":user_id}).estimatedDocumentCount((err, count) => {
        if(err) return handleError(err);
        return count;
    });
 
    var publications = await Publication.count({"user":user_id}).estimatedDocumentCount((err, count) => {
        if(err) return handleError(err);
        return count;
    });
 
    return {
        following: following,
        followed: followed,
        publications: publications
    }
}
//funcion edicion

function updateUser(req,res){
    var userId=req.params.id;
    var update = req.body;
    //borrar propiedad password
    delete update.password;
    if(userId != req.user.sub){
        return res.status(500).send({message:'no tienes la autoridad suficiente por fabor deciste'});
       }
    User.find({ $or: [
          {  email: update.email.toLowerCase() },
          {  nick: update.nick.toLowerCase()}
    ]}).exec((err,users) =>{
        
        var user_isset= false;
        users.forEach((user) =>{
        if(user && user._id != userId)  user_isset= true;  
    });
            if(user_isset) return res.status(404).send({message:'alguien mas tiene los mismo datos no se pueden tener los mismos'});
            
            
         User.findByIdAndUpdate(userId,update,{new:true},(err,userUpdated)=>{
        if(err) return res.status(500).send({messsage:'error en la peticion'});
        if(!userUpdated) return res.status(404).send({message:'no se ha podido acutalizar'});             
        return res.status(200).send({user:userUpdated});     
    });
    
    });
    
   
     }

//subir archivos de imagen

function uploadImage(req,res){
    var userId = req.params.id;
    if(userId != req.user.sub){
           return res.status(500).send({message:'no tienes autorizacion'});       
       }
    if(req.files){
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('/');
        console.log(file_split);
        var file_name = file_split[2];
        console.log(file_name);
        var ext_split= file_name.split('\.');
        console.log(ext_split);
        var file_ext = ext_split[1];
        console.log(file_ext);
        if(userId != req.user.sub){
        return   removeFilesOfUploads(res,file_path,'extension no valida');
       }
        if(file_ext=='png' || file_ext=='jpg' || file_ext=='jpeg' ||file_ext == 'gif'){
           //actualizaremos documento de usuario
            User.findByIdAndUpdate(userId,{image:file_name},{new:true},(err,updateUser)=>{
                if(err) return res.status(500).send({message:'Error en la paticion verifique'});
            
            if(!updateUser) return res.status(404).send({message:'no se ha podido actualizar'});
                                 return res.status(200).send({user: updateUser});                      
                                
            });
           }else{
           return  removeFilesOfUploads(res,file_path,'extension no valida');
           }
    }else{
        
        ////////////juanito estuvo aqui solito in ayuda de nadie mas que de mi amor por ella
        return res.status(200).send({message:'no se han subido imagenes'});
        
    }
}
 function removeFilesOfUploads(res,file_path,message){
    fs.unlink(file_path,(err)=>{
            return res.status(200).send({message:'extension no valida'});
        });
}

function getImageFile(req,res){
    var image_File = req.params.imageFile;
    var path_file = './uploads/users/'+image_File;
    fs.exists(path_file,(exists)=>{
        if(exists){
            res.sendFile(path.resolve(path_file));
           }else{
               res.status(200).send({message:'no existe este archivo'});
           }
    });
}

module.exports = {
    home,
    prueba,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
}