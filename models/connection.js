const mysql = require('mysql');
const config = require(appRoot + '/config/dbConfig');

const connection = mysql.createConnection(config);

connection.connect(function (err) {
	if(err) throw err;
});

module.exports = connection;