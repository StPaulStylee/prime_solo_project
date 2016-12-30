var pg = require('pg');

var config = {
  user: 'postgres',
  database: 'poker_users',
  password: 'Finally!',
  host: 'localhost',
  port: 5432,
}

var pool = new pg.Pool(config);
//console.log('From connection.js: ', pool);

module.exports = pool;
