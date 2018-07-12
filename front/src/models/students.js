import { baseUrl } from '../constants/constants';
import Http from './http';

import { authHeader } from "./users";

export default class Students {
	static getStudents(config) {
		if(!config || typeof config !== 'object') {
			config = {};
		}
		
		const keys = ['limit', 'offset', 'filter'];
		let data = {};
		
		keys.forEach(key => {
			if(key in config) {
				data[key] = config[key];
			}
		});
		
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/students`,
				headers: authHeader(),
				params: data
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static getStudent(id) {
		if(isNaN(id)) {
			return Promise.reject({
				'message': 'Invalid id'
			});
		}
		
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/students/${id}`,
				headers: authHeader()
			}).then(student => resolve(student), error => reject(error));
		});
	}
	
	static addStudent(data) {
		return new Promise((resolve, reject) => {
			if(typeof data !== 'object') {
				throw new Error('Object required');
			}
			
			Http.post({
				url: `${baseUrl}/students`,
				body: data,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static editStudent(id, data) {
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
				url: `${baseUrl}/students/${id}`,
				body: data,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static deleteStudent(id) {
		return new Promise((resolve, reject) => {
			if(isNaN(id)) {
				return Promise.reject({
					'message': 'Invalid id'
				});
			}
			
			Http.delete({
				url: `${baseUrl}/students/${id}`,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
}