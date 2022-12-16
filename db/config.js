const mysql = require("mysql");
const util = require("util"); //so i can use promises instead of callbacks

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employees"
});

connection.connect();

connection.query = util.promisify(connection.query);

module.exports = connection;