const connection = require('./connection');

const GROUPS_TABLE = '`groups`';

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

function rejectGroups(groups, cb) {
	let promises = [];
	
	groups.forEach(id => {
		promises.push(
			new Promise(function (resolve, reject) {
				Groups.getGroup(id).then(resolve, reject);
			})
		);
	});
	
	Promise.all(promises).then(groups => {
		cb({
			'message': `There is no enough place. Please check of ${groups.map(group => group.name).join(', ')}`
		});
	});
}

function checkExistingGroupsCount(data, escapeId = '') {
	let checkers = [];
	
	data.days.forEach((day, i) => {
		checkers[i] = new Promise(function (resolve, reject) {
			const startTime = +day.startsAt.substr(0, 2) - 2 + day.startsAt.substr(2);
			const endTime = +day.startsAt.substr(0, 2) + 2 + day.startsAt.substr(2);
			
			connection.query('SELECT * FROM groupDays WHERE weekDayId = ? AND startsAt > ? AND startsAt < ? AND groupId NOT LIKE ?', [day.weekDay, startTime, endTime, escapeId], (err, res) => {
				if(err) throw err;
				
				let noConflictGroupsCount = 0;
				
				for(let i = 0; i < res.length - 1; i++) {
					for(let j = i + 1; j < res.length; j++) {
						if(res[j].checked) {
							continue;
						}
						
						if(Math.abs(parseInt(res[i].startsAt) - parseInt(res[j].startsAt)) >= 2) {
							res[j].checked = true;
							noConflictGroupsCount++;
							break;
						}
					}
				}
				
				res.length - noConflictGroupsCount < 3 ? resolve() : reject(res.map(row => row.groupId));
			});
		});
	});
	
	return Promise.all(checkers);
}

// data for groups
const fields = ['name', 'userId', 'subjectId'];
class Groups {
	static getFullGroups(userId = '%') {
		return new Promise(function (resolve) {
			connection.query(`
				SELECT
				${GROUPS_TABLE}.id, ${GROUPS_TABLE}.name, subjectId, ${GROUPS_TABLE}.userId,
				weekDays.id as weekDayId, startsAt, weekDays.name as weekDay,
				subjects.name AS subjectName,
				users.name as userName ,users.surname as userSurname,
				students.id AS studentId, students.name as studentName, students.surname as studentSurname, students.phone as studentPhone
				FROM ${GROUPS_TABLE}
				JOIN subjects ON ${GROUPS_TABLE}.subjectId = subjects.id
				JOIN users ON ${GROUPS_TABLE}.userId = users.id
				JOIN studentsGroups ON ${GROUPS_TABLE}.id = studentsGroups.groupId
				JOIN groupDays ON groupDays.groupId = ${GROUPS_TABLE}.id
				JOIN weekDays ON groupDays.weekDayId = weekDays.id
				JOIN students ON studentsGroups.studentId = students.id
				WHERE ${GROUPS_TABLE}.userId LIKE ?
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
			connection.query(`SELECT id, name FROM ${GROUPS_TABLE} ORDER BY name LIMIT ?, ?`,
				[config['offset'], config['limit']], function (err, groups) {
					if(err) throw err;
					
					resolve(groups);
				});
		});
	}
	
	static getGroup(id){
		return new Promise((resolve) => {
			connection.query(`SELECT * FROM ${GROUPS_TABLE} WHERE id = ?`, [id], (err, groups) => {
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
			
			checkExistingGroupsCount(data).then(() => {
				connection.query(`INSERT INTO ${GROUPS_TABLE} SET ?`, insertData, (err, res) => {
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
			}, (groups) => {
				rejectGroups(groups, reject);
			});
		});
	}
	
	static editGroup(id, data) {
		return new Promise((resolve, reject) => {
			let insertData = {};
			
			fields.forEach(field => insertData[field] = data[field]);
			
			checkExistingGroupsCount(data, id).then(() => {
				connection.query(`UPDATE ${GROUPS_TABLE} SET ? WHERE id = ?`, [insertData, id], (err) => {
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
			}, (groups) => {
				rejectGroups(groups, reject);
			});
		});
	}
	
	static deleteGroup(id) {
		return new Promise((resolve) => {
			connection.query(`DELETE FROM ${GROUPS_TABLE} WHERE id = ?`, [id], (err) => {
				if(err) throw err;
				
				resolve(id);
			});
		});
	}
}

module.exports = Groups;