const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const pool = require('../database/connection');

//find by username
function findByUsername(username) {
  return new Promise(function(resolve, reject){
    pool.connect(function(err, client, done){
      if (err) {
        console.log('Error from user.js connecting to DB:', err);
        done();
        return reject(err)
      }

      client.query('SELECT * FROM users WHERE username=$1',
      [username],
      function(err, result){
        done();
        if (err) {
          console.log('Error querying the DB from user.js', err);
          reject(err);
        }
        console.log('Result from query result.rows[0]:', result.rows[0]);
        resolve(result.rows[0]);
      });
    });
  });
}

// find by id
function findById(id) {
  return new Promise(function(resolve, reject){
    pool.connect(function(err, client, done){
      if (err) {
        console.log('Error from user.js connect to DB', err);
        done();
        return reject(err);
      }

      client.query('SELECT * FROM users WHERE id=$1',
      [id],
      function(err, result){
        done();
        if (err) {
          console.log('Error querying the DB from user.js', err);
          reject(err);
        }

        console.log('Result from query result.rows[0]:', result.rows[0]);
        resolve(result.rows[0]);
      });
    });
  });
}

// Create
function create(type, username, password, bankroll) {
    return new Promise(function(resolve, reject){
      bcrypt.hash(password, SALT_ROUNDS, function(err, hash){
        if (err) {
          console.log('Error hashing password', err);
          return reject(err);
        }

        pool.connect(function(err, client, done){
          if (err) {
            console.log('Error connecting to the DB in user.js', err);
            done();
            return reject(err);
          }

          client.query('INSERT INTO users (type, username, password, bankroll) VALUES ($1, $2, $3, $4) RETURNING *',
          [type, username, hash, bankroll],
          function(err, result){
            done();
            if (err) {
              console.log('Error querying the DB from user.js', err);
              return reject(err);
            }
            console.log('Result from query result.rows[0]:', result.rows[0]);
            resolve(result.rows[0]);
          });
        });
      });
    });
}

// compare password
function comparePassword(user, passwordToCompare) {
  return new Promise(function(resolve){
    bcrypt.compare(passwordToCompare, user.password, function(err, match){
      if (err) {
        console.log('Error comparing password in user.js', err);
        return resolve(false);
      }

      console.log('Success! Passwords Matched!', match);
      resolve(match);
    });
  });
}

module.exports = {
  findByUsername: findByUsername,
  findById: findById,
  create: create,
  comparePassword: comparePassword
};
