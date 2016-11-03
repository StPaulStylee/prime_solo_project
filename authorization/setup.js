const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/user');

exports.setup = function () {
  // passport config
  //When the 'local strategy is used, the following info from the request
  // and the findAndComparePassword function is used to validate
  passport.use('local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, findAndComparePassword));

  // converts a user to a user id
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  // converts a user id to a user
  passport.deserializeUser(function(id, done){
    User.findById(id).then(function(user){
      done(null, user);
    }).catch(function(err){
      done(err);
    });
  });
};

function findAndComparePassword(username, password, done){
  // look up user by their username
  User.findByUsername(username).then(function(user){
    if(!user) {
      console.log('From setup.js: Did not find a user. Login Unsuccesfull');
      return done(null, false);
    }

    //compare the password
    User.comparePassword(user, password).then(function(isMatch){
      // indicate if their is a match
      if (isMatch) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }).catch(function(err){
    console.log('From setup.js: Error finding user', err);
    done();
  });
}
