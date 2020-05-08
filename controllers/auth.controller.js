const errorHandler = require('../utils/errorHandler')
const User = require('../models/users.model')
const jwt = require('jsonwebtoken')
const bcryptService = require('./../services/bcrypt.service')

module.exports.login = (req, res) => {
  User.findOne({ userName: req.body.userName })
    .then(function (user) {
      if (!user) {
        throw new Error('user not found!')
      } else if (
        bcryptService().comparePassword(req.body.password, user.password)
      ) {
        const JWTToken = jwt.sign(
          {
            userName: user.userName,
            _id: user._id,
            role:user.role
          },
          'secretOfSasscoTraders',
          {
            expiresIn: '9h'
          }
        )
        return res.status(200).json({
          success: 'True',
          token: JWTToken,
          userType: user.userType
        })
      } else {
        throw new Error('Incorrect Password!')
      }
    })
    .catch(error => {
      return res.status(500).json(errorHandler(err))
    })
}

module.exports.currentUser = (req, res) => {
  jwt.verify(req.params.token, 'secretOfSasscoTraders', function (err, payload) {
    if (err) {
      throw new Error('unauthorized user')
    } else {
      User.findOne({ _id: payload._id })
        .populate('userRoles')
        .lean()
        .then(user => {
          let obj = user.userRoles
          obj['name'] = user.name
          ;(obj['userName'] = user.userName), (obj['role'] = user.role)
          res.status(200).send(obj)
        })
        .catch(error => {
          return res.status(500).json(errorHandler(err))
        })
    }
  })
}
