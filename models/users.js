const sha = require("sha256");
const tokenGenerator = require("rand-token");
const connection = require('./connection');
const expDays = 5;

const USERS_TABLE = '`users`';

class Users {
	static getUsers(config = {}) {
		const defaultConfigs = {
			limit: 200,
			offset: 0,
			privilege: '%'
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
			connection.query(`SELECT id, name, surname FROM ${USERS_TABLE} WHERE privilege LIKE ? ORDER BY name LIMIT ?, ?`,
				[config['privilege'], config['offset'], config['limit']], function (err, users) {
					if(err) throw err;
					
					resolve(users);
				});
		});
	}
	
	static getUser(token = ''){
		return new Promise((resolve, reject) => {
			connection.query('SELECT * FROM tokens WHERE token = ?', [token], (err, rows) => {
				if(err) throw err;
				
				if(!rows[0]) {
					reject({
						message: 'Invalid token'
					});
					return;
				}
				
				const expDate = new Date(rows[0].expDate);
				
				if((new Date()) >= expDate) {
					reject({
						message: 'Token expired'
					});
					return;
				}
				
				const id = rows[0].userId;
				Users.getUserById(id).then(user => {
					user ? resolve(user) : reject({
						message: 'Invalid user id'
					});
				}, reject);
			})
		});
	}
	
	static getUserById(id) {
		return new Promise((resolve) => {
			connection.query(`SELECT * FROM ${USERS_TABLE} WHERE id = ?`, [id], (err, users) => {
				if(err) throw err;
				
				let user = users[0] || null;
				
				if(user) {
					delete user.password;
				}
				
				resolve(user);
			});
		});
	}
	
	static authUser(username, password) {
		password = sha(password);
		
		return new Promise((resolve, reject) => {
			connection.query(`SELECT id, privilege FROM ${USERS_TABLE} WHERE username = ? AND password = ?`, [username, password], (err, rows) => {
				if(err) {
					console.error(err);
					return;
				}
				
				
				rows[0] ? resolve(rows[0]) : reject({
					'message': 'Incorrect username or password'
				});
			});
		});
	}
	
	static setUserToken(id){
		const token = tokenGenerator.generate(64);
		
		let date = new Date();
		date.setDate(date.getDate() + expDays);
		
		return new Promise((resolve, reject) => {
			connection.query(`INSERT INTO tokens SET ?`, {
				userId: id,
				token: token,
				expDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
			}, err => err ? reject(err) : resolve(token));
		});
	}
	
	static unsetUserToken(token) {
		return new Promise((resolve) => {
			connection.query(`DELETE FROM tokens WHERE token = ?`, [token], err => {
				if(err) throw err;
				
				resolve();
			});
		});
	}
	
	static addUser(data) {
		data.password = sha(data.password);
		
		return new Promise((resolve, reject) => {
			connection.query(`INSERT INTO ${USERS_TABLE} SET ?`, data, (err, res) => {
				if(err) throw err;
				
				Users.getUserById(res.insertId).then(user => {
					user ? resolve(user) : reject({
						message: 'Invalid user id'
					});
				}, reject);
			});
		});
	}
	
	static editUser(id, data) {
		data.password = sha(data.password);
		
		return new Promise((resolve, reject) => {
			connection.query(`UPDATE ${USERS_TABLE} SET ? WHERE id = ?`, [data, id], (err) => {
				if(err) throw err;
				
				Users.getUserById(id).then(user => {
					user ? resolve(user) : reject({
						message: 'Invalid user id'
					});
				}, reject);
			});
		});
	}
	
	static deleteUser(id) {
		return new Promise((resolve) => {
			connection.query(`DELETE FROM ${USERS_TABLE} WHERE id = ?`, [id], (err) => {
				if(err) throw err;
				
				resolve(id);
			});
		});
	}
	
	/*static editUser(data) {
		return new Promise((resolve, reject) => {
			mongoDb.update([{
				"tokens.token": data.token
			}, {
				$set: {
					name: data.name,
					username: data.username
				}
			}]).then(data => {
				resolve(data);
			}, error => {
				console.log(error);
				reject(error);
			});
		});
	}
	
	static changeUserPassword(data) {
		data.password = sha(data.password);
		
		return new Promise((resolve, reject) => {
			mongoDb.update([{
				"tokens.token": data.token
			}, {
				$set: {
					password: password
				}
			}]).then(data => {
				resolve(data);
			}, error => {
				console.log(error);
				reject(error);
			});
		});
	}
	
	static cryptPassword(password) {
		return sha(password);
	}*/
}

module.exports = Users;