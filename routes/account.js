var router = require('express').Router();
const pool = require('../database/connection');

router.get('/', function(req, res){
  pool.connect(function(err, client, done){
    try {
      if(err){
        console.log('Error connecting to the DB', err);
        res.sendStatus(500);
        return;
      }
      client.query('SELECT * FROM users',
        function(err, result){
          if(err){
            console.log('Error querying the DB', err);
            res.sendStatus(500);
            return;
          }
          console.log('Success querying the DB!', result.rows);
          res.send(result.rows)
        });
    }
    finally {
      done();
    }
  });
});

module.exports = router;
