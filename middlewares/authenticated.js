'use strict'

var jwt =  require('jwt-simple');
var moment = require('moment');
var secret = 'corbulo12';
exports.ensureAuth = function (req,res,next){
    if(!req.headers.authorization){
       return res.status(403).send({messages:'la peticion no tiene la cabecera de la autentificacion'});
       }
    var token = req.headers.authorization.replace(/['"]+/g,'');
try{
    var playload = jwt.decode(token,secret);
    if(playload.exp <= moment().unix()){
       return res.status(401).send({
           message:'el token expiro'
       });
       }
} catch(ex){
    return res.status(404).send({
           message:'el token no es valido'
       });
}
req.user= playload;
    next();
}