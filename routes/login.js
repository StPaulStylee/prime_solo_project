var router = require('express').Router();
var passport = require('passport');

router.post('/', passport.authenticate('local'), function(req, res){
  res.sendStatus(200);
});

module.exports = router;
