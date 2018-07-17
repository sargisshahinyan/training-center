const connection = require('./connection');

const STUDENTS_TABLE = '`students`';
const STUDENTS_GROUPS_TABLE = '`studentsGroups`';

class Students {
	static getStudents(config = {}) {
		const defaultConfigs = {
			limit: 200,
			offset: 0,
			filter: 0,
			pending: false
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
			connection.query(`SELECT id, name, surname FROM ${STUDENTS_TABLE} WHERE archived LIKE ? ORDER BY name LIMIT ?, ?`,
				[config['filter'], config['offset'], config['limit']], function (err, students) {
					if(err) throw err;
					
					resolve(students);
				});
		});
	}
	
	static getPendingStudents() {
		return new Promise((resolve) => {
			connection.query(`SELECT id, name, surname FROM ${STUDENTS_TABLE} WHERE archived = 0 AND id NOT IN(SELECT DISTINCT studentId FROM ${STUDENTS_GROUPS_TABLE})`, function (err, students) {
				if(err) throw err;
				
				resolve(students);
			});
		});
	}
	
	static getStudent(id){
		return new Promise((resolve) => {
			connection.query(`SELECT * FROM ${STUDENTS_TABLE} WHERE id = ?`, [id], (err, students) => {
				if(err) throw err;
				
				let student = students[0] || null;
				
				resolve(student);
			});
		});
	}
	
	static addStudent(data) {
		return new Promise((resolve, reject) => {
			connection.query(`INSERT INTO ${STUDENTS_TABLE} SET ?`, data, (err, res) => {
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
			connection.query(`UPDATE ${STUDENTS_TABLE} SET ? WHERE id = ?`, [data, id], (err) => {
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
			connection.query(`DELETE FROM ${STUDENTS_TABLE} WHERE id = ?`, [id], (err) => {
				if(err) throw err;
				
				resolve(id);
			});
		});
	}
}

module.exports = Students;