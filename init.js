module.exports = () => {
    const express = require('express')
    const bodyParser = require('body-parser')
    const mongoose = require('mongoose')
    // const passport = require('passport')
    // const cookieSession = require('cookie-session')
    const cors = require('cors');
    //   const LocalStrategy = require('passport-local').Strategy;
    // const authenticationController = require('./controllers/authenticationController')
  
    const app = express()
    const PORT = process.env.PORT || 3005
  
    mongoose
      .connect(process.env.MONGO_URL)
      .then(data => {
        console.log('Connected')
      })
      .catch(err => {
        console.log('Error')
        console.log(err)
      })
  
    // required for passport
    // app.use(
    //   cookieSession({
    //     secret: 'discoverblockchainisalwaysrunning'
    //   })
    // ) 
    // session secret
    // app.use(cors({
    //   origin: 'http://134.209.239.206:4200',
    // }));
  
    // app.use(cors({
    //   origin: 'http://localhost:4200',
    // }));
  
    // app.use(function(req, res, next) {
    //   res.header("Access-Control-Allow-Origin", "*");
    //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //   next();
    // });
  
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
  
    // app.use(passport.initialize())
    // app.use(passport.session())
  
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
  
    app.listen(PORT, function () {
      console.log('Server is running on Port', PORT)
    })
    return app
  }
  