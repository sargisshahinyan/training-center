module.exports = function (req, res, next) {
	const user = res.locals.user;
	const { ADMIN_PERMISSION } = require(`${APP_PATH}/front/src/constants/permissions`);
	
	if(!user) {
		res.status(401).json({
			'message': 'User unauthorized'
		});
		return;
	}
	
	if('privilege' in user && user.privilege === ADMIN_PERMISSION) {
		next();
	} else {
		res.status(403).json({
			'message': 'You need administrator permission for this resource'
		});
	}
};