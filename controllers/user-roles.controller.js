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
  UserRoles.findOne({ userId: req.params.userId })
    .then(roles => {
      if (roles != null) {
        res.status(200).send(roles)
      }else{
        res.status(404).send({msg:'roles not found'})
      }
    }).catch(err => {
      res.status(500).json(errorHandler(err))
    })
}

module.exports.updateUserRoles = (req, res) => {
  UserRoles.findOneAndUpdate({ userId: req.body.userId }, req.body)
    .then(updatedUserRoles => {
      res.status(200).send(updatedUserRoles)
    })
    .catch(err => {
      res.status(500).json(errorHandler(err))
    })
}
