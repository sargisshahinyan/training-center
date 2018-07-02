export function isTimeValid(time) {
	const [hour, minute] = time.split(':');
	
	return !/\D/.test(hour + minute) && Number(hour) < 24 && Number(minute) < 60;
}

export function copyObject(object) {
	if(!object || typeof object !== 'object') {
		return object;
	}
	
	let copied = Array.isArray(object) ? [] : {};
	
	for(let key in object) {
		if(typeof object[key] === 'object' && object[key] !== null) {
			copied[key] = copyObject(object[key]);
		} else {
			copied[key] = object[key];
		}
	}
	
	return copied;
}

export function compareTimes(first, second) {
	if(first.substr(0, 5) === second.substr(0, 5)) {
		return 0;
	}
	
	let [firstHour, firstMinute] = first.split(':');
	let [secondHour, secondMinute] = second.split(':');
	
	firstHour = Number(firstHour);
	firstMinute = Number(firstMinute);
	secondHour = Number(secondHour);
	secondMinute = Number(secondMinute);
	
	return firstHour > secondHour || (firstHour === secondHour && firstMinute > secondMinute) ? 1 : -1;
}