class Photos {
	static convertUrlToImage(url) {
		return new Promise((resolve, reject) => {
			let img = new Image();
			img.crossOrigin = 'Anonymous';
			img.onload = function() {
				let canvas = document.createElement('CANVAS');
				let ctx = canvas.getContext('2d');
				let dataURL;
				canvas.height = img.height;
				canvas.width = img.width;
				ctx.drawImage(img, 0, 0);
				dataURL = canvas.toDataURL();
				resolve(dataURL);
			};
			img.onerror = reject;
			img.src = url;
		});
	}
	
	static convertFileToImage(file) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();
			
			if(!file) {
				reject();
			}
			
			reader.onload = (e) => {
				resolve(e.target.result);
			};
			
			reader.readAsDataURL(file);
		});
	}
}

export default Photos