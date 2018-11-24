'use strict'

var jwt =require('jwt-simple');
var moment = require('moment');
var secret = 'corbulo12';

exports.createToken =function(user){
  var playload ={
      sub:user._id,
      name:user.name,
      surname:user.surname,
      email:user.email,
      rol:user.rol,
      imagen : user.image,
      iat:moment().unix(),
      exp:moment().add(30,'days').unix
  };  
    return jwt.encode(playload,secret)
};