const User = require('../models/item.model')

module.exports.getTeam = (req, res) => {
  User.find().then(users => {
    res.status(200).json({ "wow": users })
  })
}
module.exports.addItem = (req, res) => {
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