const User = require('../models/users.model')
const jwt = require('jsonwebtoken')
const bcryptService = require('./../services/bcrypt.service')
const UserRoles = require('./../models/user-roles.model')
const errorHandler = require('../utils/errorHandler')
const adminAccess = require('../utils/adminAccess')


module.exports.setUser = async (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let userExist = await User.findOne({ userName: req.body.userName });

      if(userExist) return res.status(409).send({ message: 'user with this user name already exists' });
      
      let obj = { password: req.body.password };
      
      const hash = bcryptService().password(obj);

      req.body['password'] = hash;

      let rolesCreated =  req.body.role === 'admin' ? await UserRoles.create(adminAccess) : await UserRoles.create({});

      req.body['userRoles'] = rolesCreated._id;

      await User.create(req.body);

      return res.status(200).json({success: 'New user has been created'});

    }catch(err){
      return res.status(500).json(errorHandler(err));
    }
  })
}

module.exports.getUser = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let user = await User.find({ status: true }, { password: 0 });

      if(!user) return res.status(404).send({ message: 'Users data not found' });

      return res.status(200).send(user);

    }catch(err){
      return res.status(500).json(errorHandler(err));
    }
  })
}

module.exports.getUserNameList = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      let user = await User.find({ status: true }, { userName: 1 });

      if(!user) return res.status(404).send({ message: 'Users name not found' });

      return res.status(200).send(user);

    }catch(err){
      return res.status(500).json(errorHandler(err));
    }
  })
}

module.exports.updateUser = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.status(401).send({ message: 'not authentic user' });

      let user = await User.findOne({ _id: req.body._id,status:true });

      if (user && req.body.password && req.body.password != '' ) {
        
        let obj = { password: req.body.password };
        
        const hash = bcryptService().password(obj);
        
        req.body['password'] = hash;
        
        let updatedUserPassword = await User.findOneAndUpdate({ _id: req.body._id }, req.body);
        
        return res.status(200).send(updatedUserPassword);

      }else{
        let updatedUser = await User.findOneAndUpdate({ _id: req.body._id }, req.body);

        return res.status(200).send(updatedUser);
      }
    }catch(err){
      return res.status(500).json(errorHandler(err));
    }
  })
}

module.exports.deleteUser = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.status(401).send({ message: 'not authentic user' });

      if (payload.role != 'admin') return res.status(404).send({ message: 'You have no permission to delete the user' });

      await User.findOneAndUpdate({ _id: req.body.userId },{status:false});

      let users = await User.find({ status: true }, { password: 0 });

      if(!users) return res.status(404).send({ message: 'Users data not found' });

      return res.status(200).send(users);

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

