const errorHandler = require('../utils/errorHandler')
const User = require('../models/users.model')
const jwt = require('jsonwebtoken')
const bcryptService = require('./../services/bcrypt.service')

module.exports.login = async (req, res) => {
  try{

    let user = await User.findOne({ userName: req.body.userName,status:true })

    if(!user) throw new Error('user not found!');

    if(!bcryptService().comparePassword(req.body.password, user.password)) return res.status(404).json({message:'Incorrect Password!'});

    const JWTToken = jwt.sign({userName: user.userName,_id: user._id,role:user.role},process.env.login_key,{expiresIn: '10h'});

    return res.status(200).json({success: 'true',token: JWTToken,userType: user.userType})

  }catch(err){
      return res.status(500).send(errorHandler(err))
    }
}

module.exports.currentUser = (req, res) => {
  jwt.verify(req.params.token, process.env.login_key, async function (err, payload) {
    try{
       
      if(err) new Error('unauthorized user');

      let user = await User.findOne({ _id: payload._id }).populate('userRoles').lean()

      let obj = user.userRoles;

      obj['name'] = user.name;

      obj['userName'] = user.userName; 
      
      obj['role'] = user.role;

      return res.status(200).send(obj)

    }catch(err){
      return res.status(500).send(errorHandler(err))
    }
  })
}
