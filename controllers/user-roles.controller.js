const mongoose = require('mongoose')
const User = require('../models/users.model')
const UserRoles = require('../models/user-roles.model')
const jwt = require('jsonwebtoken')
const bcryptService = require('./../services/bcrypt.service')

let errorHandler = error => {
  return {
    stack: error.stack,
    code: error.code,
    message: error.message
  }
}

module.exports.getUserRoles = (req, res) => {
  User.findOne({ _id: req.params.userId }).populate('userRoles').lean()
    .then(roles => {
      if (roles != null) {
        let userRoles = roles.userRoles;
        userRoles['userId'] = req.params.userId;

        res.status(200).send(userRoles)
      }else{
        res.status(404).send({msg:'roles not found'})
      }
    }).catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.updateUserRoles = (req, res) => {
  UserRoles.findOneAndUpdate({ _id: req.body._id }, req.body)
    .then(updatedUserRoles => {
      res.status(200).send(updatedUserRoles)
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}
