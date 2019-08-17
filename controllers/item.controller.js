const Items = require('../models/item.model')

module.exports.getItems = (req, res) => {
  // console.log("get");

  Items.find().then(Items => {
    res.status(200).json({ Items })
  }).catch(error => {
    res.status(200).json({ "wow": error })
  })
}


module.exports.deleteItems = (req, res) => {

  Items.remove({_id :req.params.id}).then(Items => {
    res.status(200).json({ Items })
  }).catch(error => {
    res.status(200).json({ "wow": error })
  })
}


module.exports.editItems = (req, res) => {


  Items.update({_id :req.body.id}, { name: req.body.name } ).then(Items => {
    res.status(200).json({ Items })
  }).catch(error => {
    res.status(200).json({ "wow": error })
  })
}



module.exports.addItems = (req, res) => {
  Items.create(req.body).then(function (ninja) {
    res.send(ninja)
  }).catch(error => {
    res.status(500).json({
      stack: error.stack,
      code: error.code,
      message: error.message
    })
  })
}