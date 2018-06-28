const connection = require('./connection');

const table = '`groups`';

function categorizeStudents(allGroups) {
	return allGroups.reduce((groups, item) => {
		let group;
		
		if(!(group = groups.find(group => group.id === item.id))) {
			group = item;
			group.students = [];
			group.days = [];
			groups.push(group);
		}
		
		if(!group.students.some(student => student.id === item.studentId)) {
			group.students.push({
				id: item.studentId,
				name: item.studentName,
				surname: item.studentSurname,
				phone: item.studentPhone
			});
		}
		
		if(!group.days.some(day => day.id === item.weekDayId)) {
			group.days.push({
				id: item.weekDayId,
				name: item.weekDay,
				startsAt: item.startsAt
			});
		}
		
		['studentId', 'studentName', 'studentSurname', 'studentPhone', 'weekDayId', 'weekDay', 'startsAt'].forEach(field => delete group[field]);
		
		return groups;
	}, []);
}

function categorizeGroupsByUser(groups) {
	return groups.reduce((users, item) => {
		let user;
		
		if(!(user = users.find(user => user.id === item.userId))) {
			user = {
				id: item.userId,
				name: item.userName,
				surname: item.userSurname,
				subjects: []
			};
			users.push(user);
		}
		
		user.subjects.push(item);
		
		['userId', 'userName', 'userSurname'].forEach(field => delete item[field]);
		
		return users;
	}, []);
}

function categorizeUsersGroupsBySubject(users) {
	users.forEach(user => {
		user.subjects = user.subjects.reduce((subjects, group) => {
			let subject;
			
			if(!(subject = subjects.find(subject => subject.id === group.subjectId))) {
				subject = {
					id: group.subjectId,
					name: group.subjectName
				};
				subject.groups = [];
				subjects.push(subject);
			}
			
			subject.groups.push(group);
			
			['subjectId', 'subjectName'].forEach(field => delete group[field]);
			
			return subjects;
		}, []);
	});
	
	return users;
}

// data for groups
const fields = ['name', 'userId', 'subjectId'];
class Groups {
	static getFullGroups(userId = '%') {
		return new Promise(function (resolve) {
			connection.query(`
				SELECT
				${table}.id, ${table}.name, subjectId, ${table}.userId,
				weekDays.id as weekDayId, startsAt, weekDays.name as weekDay,
				subjects.name AS subjectName,
				users.name as userName ,users.surname as userSurname,
				students.id AS studentId, students.name as studentName, students.surname as studentSurname, students.phone as studentPhone
				FROM ${table}
				JOIN subjects ON ${table}.subjectId = subjects.id
				JOIN users ON ${table}.userId = users.id
				JOIN studentsGroups ON ${table}.id = studentsGroups.groupId
				JOIN groupDays ON groupDays.groupId = ${table}.id
				JOIN weekDays ON groupDays.weekDayId = weekDays.id
				JOIN students ON studentsGroups.studentId = students.id
				WHERE ${table}.userId LIKE ?
			`, [userId], (err, result) => {
				if(err) throw err;
				
				resolve(result);
			})
		})
		.then(categorizeStudents)
		.then(categorizeGroupsByUser)
		.then(categorizeUsersGroupsBySubject);
	}
	
	static getGroups(config = {}) {
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
			connection.query(`SELECT id, name FROM ${table} LIMIT ?, ?`,
				[config['offset'], config['limit']], function (err, groups) {
					if(err) throw err;
					
					resolve(groups);
				});
		});
	}
	
	static getGroup(id){
		return new Promise((resolve) => {
			connection.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, groups) => {
				if(err) throw err;
				
				let group = groups[0] || null;
				
				let pr = Promise.resolve([]);
				
				if(group) {
					pr = new Promise(function (resolve) {
						connection.query(`
								SELECT
								id, name, startsAt
								FROM groupDays
								JOIN weekDays ON weekDays.id = groupDays.weekDayId
								WHERE groupId = ?
							`, [id], (err, days) => {
							if(err) throw err;
							
							group.days = days;
							
							connection.query('SELECT studentId FROM studentsGroups WHERE groupId = ?', [id], (err, students) => {
								if(err) throw err;
								
								group.students = students.map(student => student.studentId);
								resolve();
							});
						});
						
					});
				}
				
				pr.then(() => {
					resolve(group);
				});
			});
		});
	}
	
	static addGroup(data) {
		return new Promise((resolve, reject) => {
			let insertData = {};
			
			fields.forEach(field => insertData[field] = data[field]);
			
			connection.query(`INSERT INTO ${table} SET ?`, insertData, (err, res) => {
				if(err) throw err;
				
				const groupId = res.insertId;
				
				connection.query('INSERT INTO studentsGroups (studentId, groupId) VALUES ?', [
					data.students.map(student => [student, groupId])
				], (err) => {
					if(err) throw err;
					
					connection.query('INSERT INTO groupDays (groupId, weekDayId, startsAt) VALUES ?', [
						data.days.map(day => [groupId, day.weekDay, day.startsAt])
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
		});
	}
	
	static editGroup(id, data) {
		return new Promise((resolve, reject) => {
			let insertData = {};
			
			fields.forEach(field => insertData[field] = data[field]);
			
			connection.query(`UPDATE ${table} SET ? WHERE id = ?`, [insertData, id], (err) => {
				if(err) throw err;
				
				connection.query('DELETE FROM studentsGroups WHERE groupId = ?', [id], (err) => {
					if(err) throw err;
					
					connection.query('INSERT INTO studentsGroups (studentId, groupId) VALUES ?', [
						data.students.map(student => [student, id])
					], (err) => {
						if(err) throw err;
						
						connection.query('DELETE FROM groupDays WHERE groupId = ?', [id], (err) => {
							if(err) throw err;
							
							connection.query('INSERT INTO groupDays (groupId, weekDayId, startsAt) VALUES ?', [
								data.days.map(day => [id, day.weekDay, day.startsAt])
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
			});
		});
	}
	
	static deleteGroup(id) {
		return new Promise((resolve) => {
			connection.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err) => {
				if(err) throw err;
				
				resolve(id);
			});
		});
	}
}

module.exports = Groups;