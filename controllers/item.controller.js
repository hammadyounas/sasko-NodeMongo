const Items = require('../models/item.model')

module.exports.getItems = (req, res) => {
  console.log("get");

  Items.find().then(Items => {
    res.send(Items)
  }).catch(error => {
    res.send(error)
  })
}


module.exports.deleteItems = (req, res) => {

  Items.remove({ _id: req.params.id }).then(Items => {
    res.send(Items)
  }).catch(error => {
    res.send(error)
  })
}


module.exports.editItems = (req, res) => {


  // Items.findByIdAndUpdate({ _id: req.body._id }, { name: req.body.name }, (error, doc) => {
  //   if (error)
  //     res.send(error);

  //   res.send(doc)
  // })


  Items.findByIdAndUpdate({ _id: req.body._id }, { name: req.body.name },{new: true}).exec((error, doc) => {
    if (error)
      res.send(error);

    res.send(doc)
  })

}



module.exports.addItems = (req, res) => {
  Items.create(req.body).then(function (ninja) {
    res.send(ninja)
  }).catch(error => {
    res.send(500).json({
      stack: error.stack,
      code: error.code,
      message: error.message
    })
  })
}