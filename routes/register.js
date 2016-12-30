var router = require('express').Router();
var User = require('../models/user');

router.post('/', function(req, res){
  //console.log('Registering a New User', req);
  User.create(req.body.type, req.body.username, req.body.password, req.body.bankroll).then(function(){
    res.sendStatus(201);
  }).catch(function(err){
    console.log('Error in /register', err);
    res.sendStatus(500);
  });
});

module.exports = router;
