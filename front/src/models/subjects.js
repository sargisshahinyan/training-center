import { baseUrl } from '../constants/constants';
import Http from './http';

import { authHeader } from "./users";

const headers = authHeader();

export default class Subjects {
	static getSubjects() {
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/subjects`,
				headers: headers
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
				headers: headers
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
				headers: headers
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
				headers: headers
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
				headers: headers
			}).then(response => resolve(response), error => reject(error));
		});
	}
}