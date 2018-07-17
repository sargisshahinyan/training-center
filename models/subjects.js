const connection = require('./connection');

const SUBJECTS_TABLE = '`subjects`';

class Subjects {
	static getSubjects(config = {}) {
		const defaultConfigs = {
			limit: 200,
			offset: 0
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
			connection.query(`SELECT id, name FROM ${SUBJECTS_TABLE} LIMIT ?, ?`,
				[config['offset'], config['limit']], function (err, subjects) {
					if(err) throw err;
					
					resolve(subjects);
				});
		});
	}
	
	static getSubject(id){
		return new Promise((resolve) => {
			connection.query(`SELECT * FROM ${SUBJECTS_TABLE} WHERE id = ?`, [id], (err, subjects) => {
				if(err) throw err;
				
				let subject = subjects[0] || null;
				
				if(subject) {
					delete subject.password;
				}
				
				resolve(subject);
			});
		});
	}
	
	static addSubject(data) {
		return new Promise((resolve, reject) => {
			connection.query(`INSERT INTO ${SUBJECTS_TABLE} SET ?`, data, (err, res) => {
				if(err) throw err;
				
				Subjects.getSubject(res.insertId).then(subject => {
					subject ? resolve(subject) : reject({
						message: 'Invalid subject id'
					});
				}, reject);
			});
		});
	}
	
	static editSubject(id, data) {
		return new Promise((resolve, reject) => {
			connection.query(`UPDATE ${SUBJECTS_TABLE} SET ? WHERE id = ?`, [data, id], (err) => {
				if(err) throw err;
				
				Subjects.getSubject(id).then(subject => {
					subject ? resolve(subject) : reject({
						message: 'Invalid subject id'
					});
				}, reject);
			});
		});
	}
	
	static deleteSubject(id) {
		return new Promise((resolve) => {
			connection.query(`DELETE FROM ${SUBJECTS_TABLE} WHERE id = ?`, [id], (err) => {
				if(err) throw err;
				
				resolve(id);
			});
		});
	}
}

module.exports = Subjects;