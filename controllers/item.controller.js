const Items = require('../models/item.model')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getItems = (req, res) => {
  Items.find()
    .then(Items => {
      if(Items.length){
        res.status(200).send(Items)
      }else{
        res.status(404).send({msg:'No Data Found'})
      }
    })
    .catch(error => {
      res.status(500).json(errorHandler(error));
    })
}

module.exports.deleteItems = (req, res) => {
  Items.remove({ _id: req.params.id })
    .then(Items => {
      res.send(Items)
    })
    .catch(error => {
      res.send(error)
    })
}

module.exports.editItems = (req, res) => {
  Items.findOne({ name: req.body.name })
    .then(result => {
      if (!result) {
        Items.findByIdAndUpdate(
          { _id: req.body._id },
          { name: req.body.name },
          { new: true }
        ).exec((error, doc) => {
          if (error) res.send(error)

          res.send(doc)
        })
      } else {
        res.status(409).send({ msg: 'item already exist' })
      }
    })
    .catch(error => {
      res.send(500).json({
        stack: error.stack,
        code: error.code,
        message: error.message
      })
    })
}

module.exports.addItems = (req, res) => {
  Items.findOne({ name: req.body.name })
    .then(result => {
      if (!result) {
        Items.create(req.body)
          .then(function (ninja) {
            res.send(ninja)
          })
          .catch(error => {
            res.send(500).json({
              stack: error.stack,
              code: error.code,
              message: error.message
            })
          })
      } else {
        res.status(409).send({ msg: 'item already exist' })
      }
    })
    .catch(error => {
      res.send(500).json({
        stack: error.stack,
        code: error.code,
        message: error.message
      })
    })
}
