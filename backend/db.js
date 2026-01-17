const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Elaine050816',
  database: 'multipattes'
});

module.exports = db;
