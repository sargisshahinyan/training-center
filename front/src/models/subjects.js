import { baseUrl } from '../constants/constants';
import Http from './http';

import { authHeader } from "./users";

export default class Subjects {
	static getSubjects(config) {
		if(!config || typeof config !== 'object') {
			config = {};
		}
		
		const keys = ['limit', 'offset'];
		let data = {};
		
		keys.forEach(key => {
			if(key in config) {
				data[key] = config[key];
			}
		});
		
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/subjects`,
				headers: authHeader(),
				params: data
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static getSubject(id) {
		if(isNaN(id)) {
			return Promise.reject({
				'message': 'Invalid id'
			});
		}
		
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/subjects/${id}`,
				headers: authHeader()
			}).then(subject => resolve(subject), error => reject(error));
		});
	}
	
	static addSubject(data) {
		return new Promise((resolve, reject) => {
			if(typeof data !== 'object') {
				throw new Error('Object required');
			}
			
			Http.post({
				url: `${baseUrl}/subjects`,
				body: data,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static editSubject(id, data) {
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
				url: `${baseUrl}/subjects/${id}`,
				body: data,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static deleteSubject(id) {
		return new Promise((resolve, reject) => {
			if(isNaN(id)) {
				return Promise.reject({
					'message': 'Invalid id'
				});
			}
			
			Http.delete({
				url: `${baseUrl}/subjects/${id}`,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
}