const express= require('express');
const router = express.Router();

// models
const Users = require(APP_PATH + '/models/users');
const Photos = require(APP_PATH + '/models/photos');

// helpers
const helpers = require(APP_PATH + '/libs/helpers');
const emailValidator = require('email-validator');
const sha = require('sha256');

// data
const fields = ['name', 'surname', 'email', 'phone', 'username', 'password', 'password-retype', 'privilege'];
const optionalFields = ['avatar'];

// middleware
const authCheckingMiddleware = require(`${APP_PATH}/middlewares/authCheckingMiddleware`);
const adminPermissionMiddleware = require(`${APP_PATH}/middlewares/adminPermissionMiddleware`);

router.post('/auth', function (req, res) {
	const data = req.body;
	
	const param = helpers.getMissingParam({
		keys: ['username', 'password'],
		data: data
	});
	
	if(param) {
		res.status(403).json({
			message: `${param.replace(/^./, l => l.toUpperCase())} is missing`
		});
		return;
	}
	
	Users.authUser(data.username, data.password).then(user => {
		Users.setUserToken(user.id).then(token => {
			res.json({
				token,
				privilege: user.privilege || 0
			});
		});
	}, () => {
		res.status(404).json({
			message: "Incorrect username or password"
		});
	});
});

router.use(authCheckingMiddleware);

router.get('/check', function (req, res) {
	res.json({
		'message': 'Token is valid'
	});
});

router.use('/logout', function(req, res) {
	Users.unsetUserToken(res.locals.user.token).then(() => {
		res.json({
			message: 'Token has been removed'
		});
	}, err => res.status(400).json(err));
});

router.get('/', function (req, res) {
	const keys = ['limit', 'offset', 'privilege'];
	let data = {};
	
	keys.forEach(key => {
		if(key in req.query) {
			data[key] = req.query[key];
		}
	});
	
	Users.getUsers(data).then(users => res.json(users), err => res.status(404).json(err));
});

router.use(adminPermissionMiddleware);

router.get('/:id', function(req, res) {
	const id = Number(req.params.id);
	
	if(isNaN(id)) {
		res.status(403).json({
			message: 'Invalid id'
		});
		return;
	}
	
	Users.getUserById(id).then(user => res.json(user), err => res.status(404).json(err));
});

router.post('/', function (req, res) {
	const param = helpers.getMissingParam({
		keys: fields,
		data: req.body
	});

	if(param) {
		res.status(403).json({
			'message': `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	let data = {};
	
	fields.forEach(field => data[field] = req.body[field]);
	optionalFields.forEach(field => {
		if(field in req.body) {
			data[field] = req.body[field];
		}
	});
	
	if(!emailValidator.validate(data.email)) {
		res.status(403).json({
			'message': 'Invalid email address'
		});
		return;
	}
	
	if(data.password !== data['password-retype']) {
		res.status(403).json({
			'message': 'Passwords do\'nt match'
		});
		return;
	} else {
		delete data['password-retype'];
	}
	
	if(data.avatar) {
		const fileName = `/img/avatars/${sha(Date.now().toString())}`;
		const path = `${APP_PATH}/front/build`;
		
		Photos.createPhoto(fileName, path, data.avatar).then(img => {
			data.avatar = img;
			addUser(data);
		}, err => res.status(403).json(err));
	} else {
		addUser(data);
	}
	
	function addUser(data) {
		Users.addUser(data).then(user => {
			res.status(201).json({
				'message': 'User has been created successfully'
			});
		}, err => res.status(400).json(err));
	}
});

router.put('/:id', function (req, res) {
	const id = Number(req.params.id);
	
	if(isNaN(id)) {
		res.status(403).json({
			message: 'Invalid id'
		});
		return;
	}
	
	const param = helpers.getMissingParam({
		keys: fields,
		data: req.body
	});
	
	if(param) {
		res.status(403).json({
			'message': `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	const data = {};
	
	fields.forEach(field => data[field] = req.body[field]);
	optionalFields.forEach(field => {
		if(field in req.body) {
			data[field] = req.body[field];
		}
	});
	
	if(!emailValidator.validate(data.email)) {
		res.status(403).json({
			'message': 'Invalid email address'
		});
		return;
	}
	
	if(data.password !== data['password-retype']) {
		res.status(403).json({
			'message': 'Passwords do\'nt match'
		});
		return;
	} else {
		delete data['password-retype'];
	}
	
	Users.getUserById(id).then((user) => {
		const fileName = `/img/avatars/${sha(Date.now().toString())}`;
		const filePath = `${APP_PATH}/front/build`;
		
		if(user.avatar) {
			Photos.deletePhoto(filePath, user.avatar);
		}
		
		let promise = Promise.resolve();
		
		if(data.avatar) {
			promise = Photos.createPhoto(fileName, filePath, data.avatar).then(img => {
				data.avatar = img;
			}, err => {
				console.error(err);
				data.avatar = null;
			});
		}
		
		promise.then(() => {
			Users.editUser(id, data).then(() => {
				res.json({
					'message': 'User has been updated successfully'
				});
			}, err => res.status(400).json(err));
		});
		
	});
});

router.delete('/:id', function (req, res) {
	const id = Number(req.params.id);
	
	if(isNaN(id)) {
		res.status(403).json({
			message: 'Invalid id'
		});
		return;
	}
	
	Users.getUserById(id).then(user => {
		if(user.avatar) {
			Photos.deletePhoto(`${APP_PATH}/front/build`, user.avatar);
		}
		
		Users.deleteUser(id).then(id => res.json({
			'message': 'User deleted successfully'
		}), err => res.status(400).json(err));
	});
});

module.exports = router;