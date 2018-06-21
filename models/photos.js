const fs = require("fs");
const isImage = require("is-image");
const path = require('path');

class Photos{
	static createPhoto(name = '', filePath = '', avatar) {
		return new Promise((resolve, reject) => {
			let extension;
			const paths = path.resolve(path.normalize(filePath + name)).split(path.sep);
			paths.pop();
			
			try {
				extension = avatar.match(/\/(.+?);/)[1];
			} catch (e) {
				reject({
					message: "Invalid image"
				});
				return;
			}
			
			paths.reduce(function (fullPath, directory) {
				fullPath += directory + path.sep;
				
				if(!fs.existsSync(fullPath)) {
					fs.mkdir(fullPath);
				}
				
				return fullPath;
			}, '');
			
			name += `.${extension}`;
			avatar = avatar.replace(/http:\/\/|https:\/\//, "");
			
			fs.writeFile(path.resolve(path.normalize(filePath + name)), avatar.replace(new RegExp(`^data:image\\/${extension};base64,`), ""), 'base64', (err) => {
				if(err) {
					throw err;
				}
				
				if(!isImage(name)) {
					fs.unlinkSync(filePath + name);
					reject({
						message: "Is not valid image"
					});
					return;
				}
				
				resolve(name);
			});
		});
	}
	
	static deletePhoto(path = '', name = '') {
		if(fs.existsSync(path + name)) {
			fs.unlinkSync(path + name);
		}
	}
}

module.exports = Photos;