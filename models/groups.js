const conn = require('./connection');

const table = '`groups`';

// data for groups
const fields = ['name', 'userId', 'subjectId'];
class Groups {
	static getGroups(config = {}) {
		const defaultConfigs = {
			limit: 20,
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
				[config['offset'], config['limit']], function (err, groups) {
					if(err) throw err;
					
					resolve(groups);
				});
		});
	}
	
	static getGroup(id){
		return new Promise((resolve) => {
			conn.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, groups) => {
				if(err) throw err;
				
				let group = groups[0] || null;
				
				let pr = Promise.resolve([]);
				
				if(group) {
					pr = new Promise(function (resolve) {
						conn.query('SELECT studentId FROM studentsGroups WHERE groupId = ?', [id], (err, students) => {
							if(err) throw err;
							
							resolve(students.map(student => student.studentId));
						});
					});
				}
				
				pr.then(students => {
					group.students = students;
					
					resolve(group);
				});
			});
		});
	}
	
	static addGroup(data) {
		return new Promise((resolve, reject) => {
			let insertData = {};
			
			fields.forEach(field => insertData[field] = data[field]);
			
			conn.query(`INSERT INTO ${table} SET ?`, insertData, (err, res) => {
				if(err) throw err;
				
				const groupId = res.insertId;
				
				conn.query('INSERT INTO studentsGroups (studentId, groupId) VALUES ?', [
					data.students.map(student => [student, groupId])
				], (err) => {
					if(err) throw err;
					
					Groups.getGroup(res.insertId).then(group => {
						group ? resolve(group) : reject({
							message: 'Invalid group id'
						});
					}, reject);
				});
			});
		});
	}
	
	static editGroup(id, data) {
		return new Promise((resolve, reject) => {
			let insertData = {};
			
			fields.forEach(field => insertData[field] = data[field]);
			
			conn.query(`UPDATE ${table} SET ? WHERE id = ?`, [insertData, id], (err) => {
				if(err) throw err;
				
				conn.query('DELETE FROM studentsGroups WHERE groupId = ?', [id], (err) => {
					if(err) throw err;
					
					conn.query('INSERT INTO studentsGroups (studentId, groupId) VALUES ?', [
						data.students.map(student => [student, id])
					], (err) => {
						if(err) throw err;
						
						Groups.getGroup(id).then(group => {
							group ? resolve(group) : reject({
								message: 'Invalid group id'
							});
						}, reject);
					});
				});
			});
		});
	}
	
	static deleteGroup(id) {
		return new Promise((resolve) => {
			conn.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err) => {
				if(err) throw err;
				
				resolve(id);
			});
		});
	}
}

module.exports = Groups;