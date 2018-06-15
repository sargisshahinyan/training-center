import { baseUrl } from '../constants/constants';
import Http from './http';

const headers = {
	'Content-Type': 'application/json'
};

function getUserKey() {
	return localStorage.getItem("token");
}

export function authHeader() {
	return Object.assign({
		Authorization: 'Basic ' + getUserKey()
	}, headers);
}

export default class Users {
	static getUsers() {
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/users`,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static getUser(id) {
		if(isNaN(id)) {
			return Promise.reject({
				'message': 'Invalid id'
			});
		}
		
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/users/${id}`,
				headers: authHeader()
			}).then(user => resolve(user), error => reject(error));
		});
	}
	
	static checkUser() {
		const token = getUserKey();
		
		if(!token) {
			return Promise.reject(null);
		}
		
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/users/check`,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static authUser(username, password) {
		return new Promise((resolve, reject) => {
			Http.post({
				url: `${baseUrl}/users/auth`,
				body: {
					username: username,
					password: password
				},
				headers: headers
			}).then(response => resolve(response), error => reject(error));
		})
	}
	
	static setUser(user) {
		localStorage.setItem("token", user.token || '');
	}

	static forgetUser() {
		return Http.get({
			url: `${baseUrl}/users/logout`,
			headers: authHeader()
		}).then(() => localStorage.removeItem("token"));
	}
	
	static addUser(data) {
		return new Promise((resolve, reject) => {
			if(typeof data !== 'object') {
				throw new Error('Object required');
			}
			
			const token = getUserKey();
			
			if(!token) {
				return Promise.reject(null);
			}
			
			Http.post({
				url: `${baseUrl}/users`,
				body: data,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static editUser(id, data) {
		return new Promise((resolve, reject) => {
			if(typeof data !== 'object') {
				throw new Error('Object required');
			}
			
			if(isNaN(id)) {
				return Promise.reject({
					'message': 'Invalid id'
				});
			}
			
			Http.put({
				url: `${baseUrl}/users/${id}`,
				body: data,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static deleteUser(id) {
		return new Promise((resolve, reject) => {
			if(isNaN(id)) {
				return Promise.reject({
					'message': 'Invalid id'
				});
			}
			
			Http.delete({
				url: `${baseUrl}/users/${id}`,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static getHeaders(authorized = true) {
		return authorized ? authHeader() : headers;
	}
}