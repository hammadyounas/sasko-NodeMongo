const User = require('../models/item.model')

module.exports.getItems = (req, res) => {
  console.log("get");

  User.find().then(Items => {
    res.status(200).json({ Items })
  }).catch(error => {
    res.status(200).json({ "wow": error })
  })
}


module.exports.addItems = (req, res) => {
  User.create(req.body).then(function (ninja) {
    res.send(ninja)
  }).catch(error => {
    res.status(500).json({
      stack: error.stack,
      code: error.code,
      message: error.message
    })
  })
}