import { baseUrl } from '../constants/constants';
import Http from './http';

import { authHeader } from "./users";

export default class Groups {
	static getWeekDays() {
		return new Promise((resolve, reject) => {
			Http.get({
				url: `${baseUrl}/date/weekDays`,
				headers: authHeader()
			}).then(response => resolve(response), error => reject(error));
		});
	}
}