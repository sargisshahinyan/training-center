import { baseUrl } from '../constants/constants';
import Http from './http';

import { authHeader } from "./users";

export default class Groups {
	static getGroups(config) {
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
				url: `${baseUrl}/groups`,
				headers: authHeader(),
				params: data
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static getGroup(id) {
		if(isNaN(id)) {
			return Promise.reject({
				'message': 'Invalid id'
			});
		}
		
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/groups/${id}`,
				headers: authHeader()
			}).then(group => resolve(group), error => reject(error));
		});
	}
	
	static addGroup(data) {
		return new Promise((resolve, reject) => {
			if(typeof data !== 'object') {
				throw new Error('Object required');
			}
			
			Http.post({
				url: `${baseUrl}/groups`,
				body: data,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static editGroup(id, data) {
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
				url: `${baseUrl}/groups/${id}`,
				body: data,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static deleteGroup(id) {
		return new Promise((resolve, reject) => {
			if(isNaN(id)) {
				return Promise.reject({
					'message': 'Invalid id'
				});
			}
			
			Http.delete({
				url: `${baseUrl}/groups/${id}`,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
	
	static getGroupsData() {
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/groups/all`,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
}