module.exports = () => {
  const express = require('express')
  const bodyParser = require('body-parser')
  const mongoose = require('mongoose')
  const cors = require('cors');

  const app = express()
  const PORT = process.env.PORT || 3000

  mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true,useUnifiedTopology: true })
    .then(data => {
      console.log('mongo Connected');

    })
    .catch(err => {
      console.log('Error')
      console.log(err)
    })

  app.use(cors());
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.listen(PORT, function () {
    console.log('Server is running on Port', PORT)
  })
  return app
}
