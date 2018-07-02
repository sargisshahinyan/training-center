function obj2query(data) {
	let params = new URLSearchParams();
	
	
	for(let key in data) {
		if(data.hasOwnProperty(key)) {
			params.append(key, data[key]);
		}
	}
	
	return '?' + params.toString();
}

function modifyOptions(options) {
	let url = options.url;
	
	if(typeof url !== 'string') {
		throw new Error('Invalid url');
	}
	
	if(typeof options.params === 'object') {
		url += obj2query(options.params);
		
		delete options.params;
	}
	
	if(typeof options.body === 'object') {
		if(typeof options.headers === 'object') {
			switch (options.headers['Content-Type']) {
				default:
					options.headers['Content-Type'] = 'application/json';
				case 'application/json':
					options.body = JSON.stringify(options.body);
					break;
				case 'multipart/form-data':
				case 'application/x-www-form-urlencoded':
					options.body = options.body instanceof FormData ? options.body : obj2query(options.body);
					break;
			}
		} else {
			options.headers['Content-Type'] = 'application/json';
			options.body = JSON.stringify(options.body);
		}
	}
	options.mode = options.mode || 'cors';
	
	options.url = url;
}

export default class Http{
	static get(options) {
		if(typeof options !== 'object') {
			throw new Error('Invalid argument');
		}
		
		options.method = 'GET';
		
		return Http.request(options);
	}
	
	static post(options) {
		if(typeof options !== 'object') {
			throw new Error('Invalid argument');
		}
		
		options.method = 'POST';
		
		return Http.request(options);
	}
	
	static put(options) {
		if(typeof options !== 'object') {
			throw new Error('Invalid argument');
		}
		
		options.method = 'PUT';
		
		return Http.request(options);
	}
	
	static delete(options) {
		if(typeof options !== 'object') {
			throw new Error('Invalid argument');
		}
		
		options.method = 'DELETE';
		
		return Http.request(options);
	}
	
	static request(options) {
		modifyOptions(options);
		const url = options.url;
		
		return new Promise((resolve, reject) => {
			fetch(url, options).then(response => {
				response.json().then(data => {
					response.ok ? resolve(data) : reject(data)
				});
			}, error => {
				reject(error);
			});
		});
	}
}