const mongoose = require('mongoose')
const User = require('../models/users.model')
const jwt = require('jsonwebtoken')
const bcryptService = require('./../services/bcrypt.service')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.setUser = (req, res) => {
  User.findOne({ userName: req.body.userName }).then(userExist => {
    if (userExist != null) {
      res.status(409).send({ msg: 'user with this user name already exists' })
    } else {
      let obj = { password: req.body.password }
      const hash = bcryptService().password(obj)
      req.body['password'] = hash
      User.create(req.body)
        .then(userCreated => {
          const JWTToken = jwt.sign(
            {
              userName: userCreated.userName,
              _id: userCreated._id,
              role: userCreated.role
            },
            'secretOfSasscoTraders',
            {
              expiresIn: '2h'
            }
          )
          res.status(200).json({
            success: 'New user has been created',
            token: JWTToken
          })
        })
        .catch(error => {
          res.status(500).json({
            stack: error.stack,
            code: error.code,
            message: error.message
          })
        })
    }
  })
}

module.exports.getUser = (req, res) => {
  User.find({ status: true }, { password: 0 })
    .then(user => {
      if (user.length > 0) {
        res.status(200).send(user)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.getUserNameList = (req, res) => {
    User.find({ status: true }, { userName: 1 })
    .then(user => {
      if (user.length > 0) {
        res.status(200).send(user)
      } else {
        res.status(404).send({ msg: 'No Data Found' })
      }
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.updateUser = (req, res) => {
  User.findOne({ _id: req.body._id }).then(user => {
    if (req.body.password && req.body.password != '') {
      let obj = { password: req.body.password }
      const hash = bcryptService().password(obj)
      req.body['password'] = hash
      User.findOneAndUpdate({ _id: req.body._id }, req.body)
        .then(updatedUser => {
          res.status(200).send(updatedUser)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    } else {
      User.findOneAndUpdate({ _id: req.body._id }, req.body)
        .then(updatedUser => {
          res.status(200).send(updatedUser)
        })
        .catch(err => {
          res.status(500).json(errorHandler(err))
        })
    }
  })
}

module.exports.getAuth = (req, res) => {
  var scopes = 'user-read-private user-read-email'
  res.redirect(
    'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' +
      '3ca99f839cf54b80a810a2af0d5dac36' +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' +
      encodeURIComponent('https://404app.000webhostapp.com/')
  )
}
// module.exports.deleteUploadedPdf = (req, res) => {
//     User.findByIdAndRemove({ _id: req.params.id })
//         .then(resp => {
//             res.status(200).send(resp)
//         })
//         .catch(err => {
//             res.status(500).json(errorHandler(err))
//         })
// }
