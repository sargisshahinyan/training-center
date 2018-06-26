export function isTimeValid(time) {
	const [hour, minute] = time.split(':');
	
	return Number(hour) < 24 && Number(minute) < 60;
}