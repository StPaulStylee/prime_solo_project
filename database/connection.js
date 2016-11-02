var pg = require('pg');

var config = {
  database: 'poker_users'
}

var pool = new pg.Pool(config);

module.export = pool;
