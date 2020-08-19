const User = require('../models/users.model')
const UserRoles = require('../models/user-roles.model')
const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler')


module.exports.getUserRoles = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{
      
      if(err) return res.status(401).send({ message: 'not authentic user' });

      if(!(payload.role == 'admin')) return res.status(404).send({ message: 'You have no permission to access the roles' }) ;

      let roles = await User.findOne({ _id: req.params.userId }).populate('userRoles').lean();

      if(!roles) return res.status(404).send({ message: 'roles not found' });

      let userRoles = roles.userRoles;
      
      userRoles['userId'] = req.params.userId;
      
      return res.status(200).send(userRoles);

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}

module.exports.updateUserRoles = (req, res) => {
  jwt.verify(req.query.token, process.env.login_key, async function (err,payload) {
    try{

      if(err) return res.send(401).send({ message: 'not authentic user' });

      if (payload.role != 'admin') return res.status(404).send({ message: 'You have no permission to access the roles' })

      let updatedUserRoles = await UserRoles.findOneAndUpdate({ _id: req.body._id }, req.body)

      return res.status(200).send(updatedUserRoles)

    }catch(err){
      return res.status(500).json(errorHandler(err))
    }
  })
}
