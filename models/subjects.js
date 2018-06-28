const conn = require('./connection');

const table = '`subjects`';

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
			conn.query(`SELECT id, name FROM ${table} LIMIT ?, ?`,
				[config['offset'], config['limit']], function (err, subjects) {
					if(err) throw err;
					
					resolve(subjects);
				});
		});
	}
	
	static getSubject(id){
		return new Promise((resolve) => {
			conn.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, subjects) => {
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
			conn.query(`INSERT INTO ${table} SET ?`, data, (err, res) => {
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
			conn.query(`UPDATE ${table} SET ? WHERE id = ?`, [data, id], (err) => {
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
			conn.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err) => {
				if(err) throw err;
				
				resolve(id);
			});
		});
	}
}

module.exports = Subjects;