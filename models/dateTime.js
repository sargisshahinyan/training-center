const connection = require('./connection');

class DateTime {
	static getWeekDays() {
		return new Promise(function (resolve) {
			connection.query('SELECT * FROM weekDays', (err, days) => {
				if(err) throw err;
				
				resolve(days);
			})
		});
	}
}

module.exports = DateTime;