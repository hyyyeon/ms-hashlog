// mysql.js
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yoon',
  database: 'yoonjihyeon'
});
module.exports = connection;
