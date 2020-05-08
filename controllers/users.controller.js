const User = require('../models/users.model')
const jwt = require('jsonwebtoken')
const bcryptService = require('./../services/bcrypt.service')
const UserRoles = require('./../models/user-roles.model')
const errorHandler = require('../utils/errorHandler')


module.exports.setUser = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let userExist = await User.findOne({ userName: req.body.userName })

      if(userExist) res.status(409).send({ msg: 'user with this user name already exists' })
      
      let obj = { password: req.body.password }
      
      const hash = bcryptService().password(obj)

      req.body['password'] = hash

      let rolesCreated = await UserRoles.create({})

      req.body['userRoles'] = rolesCreated._id

      let userCreated = await User.create(req.body)

      const JWTToken = jwt.sign(
        {
          userName: userCreated.userName,
          _id: userCreated._id,
          role: userCreated.role
        },
        process.env.login_key,
        {
          expiresIn: '2h'
        }
      )

      return res.status(200).json({success: 'New user has been created',token: JWTToken})

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.getUser = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' })

      let user = await User.find({ status: true }, { password: 0 })

      if(!user) return res.status(404).send({ msg: 'No Data Found' })

      return res.status(200).send(user)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.getUserNameList = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' })

      let user = await User.find({ status: true }, { userName: 1 })

      if(!user) return res.status(404).send({ msg: 'No Data Found' })

      return res.status(200).send(user)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.updateUser = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (
    err,
    payload
  ) {
    try{

      if(err) return res.status(401).send({ message: 'not authentic user' })

      let user = await User.findOne({ _id: req.body._id })

      if (user && req.body.password && req.body.password != '' ) {
        
        let obj = { password: req.body.password }
        
        const hash = bcryptService().password(obj)
        
        req.body['password'] = hash
        
        let updatedUserPassword = await User.findOneAndUpdate({ _id: req.body._id }, req.body)
        
        return res.status(200).send(updatedUserPassword)

      }else{
        let updatedUser = await User.findOneAndUpdate({ _id: req.body._id }, req.body)

        return res.status(200).send(updatedUser)
      }
    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

// module.exports.getAuth = (req, res) => {
//   var scopes = 'user-read-private user-read-email'
//   res.redirect(
//     'https://accounts.spotify.com/authorize' +
//       '?response_type=code' +
//       '&client_id=' +
//       '3ca99f839cf54b80a810a2af0d5dac36' +
//       (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
//       '&redirect_uri=' +
//       encodeURIComponent('https://404app.000webhostapp.com/')
//   )
// }
