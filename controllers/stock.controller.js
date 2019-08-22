const Stock = require('../models/stock.model')

module.exports.getStock = (req, res) => {
  console.log("get");

  Stock.find().then(Stock => {
    res.send(Stock)
  }).catch(error => {
    res.send(error)
  })
}


module.exports.deleteStock = (req, res) => {

  Stock.remove({_id :req.params.id}).then(Stock => {
    res.send(Stock)
  }).catch(error => {
    res.send( error)
  })
}


module.exports.editStock = (req, res) => {


  Stock.update({_id :req.body.id}, { name: req.body.name } ).then(Stock => {
    res.send(Stock)
  }).catch(error => {
    res.send(error)
  })
}



module.exports.addStock = (req, res) => {
  Stock.create(req.body).then(function (ninja) {
    res.send(ninja)
  }).catch(error => {
    res.send(500).json({
      stack: error.stack,
      code: error.code,
      message: error.message
    })
  })
}