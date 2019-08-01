// const express=require('express');
// const bodyParser= require('body-parser')
// const mongoose = require('mongoose')
// var cors = require('cors')
// //Set Up Express App
// const app=express();

// mongoose.Promise = require('bluebird');
// mongoose.connect('mongodb://AAK:abc123@ds135003.mlab.com:35003/restapi')

//     .then(() => {
//       console.log('Start');
//     })
//     .catch(err => {
//         console.error('App starting error:', err.stack);
//         process.exit(1);
//     })
// app.use(bodyParser.json())
// app.use(cors())
// //Initialize Routes
// app.use('/api',require('./routes/api'));

// //Error handling 
// app.use(function(error,req,res,next){
//     console.log(error)
//     res.status(422).send(JSON.stringify({error:error.message}));
// })

// //listen for requests
// var port = process.env.PORT || 3000;
// app.listen(port, "0.0.0.0", function() {
// console.log("Listening on Port 3000");
// });



require('dotenv').config()
const router = require('./routes/index.routes');
const app = require('./init')();

app.use(process.env.API_ENDPOINT || '/', router);





















