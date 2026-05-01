const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host: config.DB.host,
  user: config.DB.user,
  password: config.DB.password,
  database: config.DB.database,
  socketPath: '/var/run/mysqld/mysqld.sock',
  waitForConnections: config.DB.waitForConnections,
  connectionLimit: config.DB.connectionLimit,
  queueLimit: config.DB.queueLimit
});

module.exports = pool;
