const Users = require(APP_PATH + '/models/users');

module.exports = function (req, res, next) {
	const header = req.headers['authorization'] || '',
		token = header.split(/\s+/).pop() || '';
	
	if(!token) {
		res.status(401).json({
			message: 'Token required'
		});
		return;
	}
	
	Users.getUser(token).then(user => {
		Object.defineProperty(user, 'token', {
			value: token,
			writable: true
		});
		res.locals.user = user;
		next();
	}, err => res.status(401).json(err));
};