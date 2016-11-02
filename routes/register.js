var router = ('express').Router();
var User = require('../models/user');

router.post('/', function(req, res){
  console.log('Registering a New User');
  User.create(req.body.username, req.body.password).then(function(){
    res.sendStatus(201);
  }).catch(function(err){
    console.log('Error in /register', err);
    res.sendStatus(500);
  });
});

module.export = router;
