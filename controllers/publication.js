'use strict'

var path = require('path');
var fs = require('fs');
var moment= require('moment');
var mongoosePaginate= require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req,res){
  return  res.status(200).send({
        message:"hola desd el controlador de prueba de publicaciones"
    });
}


function savePublication(req,res){
    var params = req.body;
    
    
    if(!params.text) res.status(200).send({mesage:'debes mandar un texto'});
    var publication = new Publication();
    publication.title = params.text;
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();
    
    publication.save((err,publicationStored)=>{
        if(err) return res.status(500).send({message:'error al guardar la publicacion'});
    
        if(!publicationStored) return res.status(404).send({message:'la publicacion no se ha guardado'});
        
        
        return res.status(200).send({publication:publicationStored});
    });
}
function getPublications(req,res){
    var page = 1;  
    if(req.params.page){
        page = req.params.page;
    }     
    var itemsPerPage = 4;
    
    Follow.find({user:req.user.sub}).populate('followed').exec((err,follows)=>{
        if(err) return res.status(500).send({message:'error al devolver la publicacion'});
        
        var follows_clean=[];
        follows.forEach((follow)=>{
            follows_clean.push(follow.followed);
        });
        Publication.find({user:{"$in":follows_clean}}).sort('-created_at').populate('user').paginate(page,itemsPerPage,(err,publications,total)=>{
            if(err) return res.status(500).send({message:'error al devolver la publicaciones'});
            
            if(!publications) return res.status(404).send({message:'no hay publicaciones'});
            
            return res.status(200).send({
                total_items:total,
                pages:Math.ceil(total/itemsPerPage),
                page:page,
                publications
            })
        });
    });
}

function getPublication(req,res){
    var PublicationId = req.params.id;
    
    Publication.findById(PublicationId,(err,publication)=>{
         
            if(err) return res.status(500).send({message:'error al devolver la publicaciones'});
            
            if(!publication) return res.status(404).send({message:'no hay publicaciones'});
       return res.status(200).send({publication});
    });
}

function deletePublication(req,res){
    var publicationId = req.params.id;
    
    Publication.find({'user': req.user.sub,'_id':publicationId}).remove(err=>{
        if(err) return res.status(500).send({message:"Error al borrar publicaciones"});
         
       if(!publicationRemoved) return res.status(404).send({message:"no existe la publicacion"});
    
     return res.status(200).send({message:'publicacion eliminada'});
    });
    
    
    
}


////////////////////revidar por redundancia en el codigo con usuarios pendiente;




function uploadImage(req,res){
    var publicationrId = req.params.id;
    
    if(req.files){
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('\\');
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
            Publication.findOne({'user':req.user.sub,'_id':publicationId}).exec((err,publication)=>{
                if(publication){
                   Publication.findByIdAndUpdate(publicationrId,{file:file_name},{new:true},(err,publicationUpdate)=>{
                if(err) return res.status(500).send({message:'Error en la paticion verifique'});
            
            if(!publicationUpdate) return res.status(404).send({message:'no se ha podido actualizar'});
                                 return res.status(200).send({publication: publicationUpdate});                      
                                
            });
                   }else{
                        return  removeFilesOfUploads(res,file_path,'no tienes los permisos suficientes para actualizar esto');
                   }
            });
            
            
           }else{
           return  removeFilesOfUploads(res,file_path,'extension no valida');
           }
    }else{
        
        ////////////jmejorar el codigo  por fallos en la logica del programa especialmente en el count por 
        /////////////falla en la compatibilidad de versiones para futuros cambios
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
    var path_file = './uploads/publications/'+image_File;
    fs.exists(path_file,(exists)=>{
        if(exists){
            res.sendFile(path.resolve(path_file));
           }else{
               res.status(200).send({message:'no existe este archivo'});
           }
    });
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////77
module.exports={
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    removeFilesOfUploads,
    getImageFile
}
