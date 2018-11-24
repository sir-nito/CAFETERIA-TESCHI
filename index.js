'use strict'
////////////////codigo de conexion
var mongoose=require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/RED_SOCIAL',{ useNewUrlParser: true })
.then(()=> {  console.log('conexion correcta ella no te amara');
                         //crear servidor
                          app.listen(port,()=>{
               console.log("server runing in  http://localhost:3800");
})
                         
                         })
.catch(err => console.log(err));
////////////////////////////////////7


