const conn = require('./connection');

const table = '`students`';

class Students {
	static getStudents(config = {}) {
		const defaultConfigs = {
			limit: 200,
			offset: 0,
			archived: 0
		};
		
		if(!config || typeof config !== 'object') {
			config = {};
		}
		
		for(let prop in defaultConfigs) {
			if(!defaultConfigs.hasOwnProperty(prop)) {
				continue;
			}
			
			config[prop] = !isNaN(parseInt(config[prop])) ? parseInt(config[prop]) : defaultConfigs[prop];
		}
		
		return new Promise((resolve) => {
			conn.query(`SELECT id, name, surname FROM ${table} WHERE archived LIKE ? LIMIT ?, ?`,
				[config['archived'], config['offset'], config['limit']], function (err, students) {
					if(err) throw err;
					
					resolve(students);
				});
		});
	}
	
	static getStudent(id){
		return new Promise((resolve) => {
			conn.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, students) => {
				if(err) throw err;
				
				let student = students[0] || null;
				
				if(student) {
					delete student.password;
				}
				
				resolve(student);
			});
		});
	}
	
	static addStudent(data) {
		return new Promise((resolve, reject) => {
			conn.query(`INSERT INTO ${table} SET ?`, data, (err, res) => {
				if(err) throw err;
				
				Students.getStudent(res.insertId).then(student => {
					student ? resolve(student) : reject({
						message: 'Invalid student id'
					});
				}, reject);
			});
		});
	}
	
	static editStudent(id, data) {
		return new Promise((resolve, reject) => {
			conn.query(`UPDATE ${table} SET ? WHERE id = ?`, [data, id], (err) => {
				if(err) throw err;
				
				Students.getStudent(id).then(student => {
					student ? resolve(student) : reject({
						message: 'Invalid student id'
					});
				}, reject);
			});
		});
	}
	
	static deleteStudent(id) {
		return new Promise((resolve) => {
			conn.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err) => {
				if(err) throw err;
				
				resolve(id);
			});
		});
	}
}

module.exports = Students;