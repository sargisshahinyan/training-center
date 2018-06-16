const express= require('express');
const router = express.Router();

// models
const Users = require(appRoot + '/models/users');
const Photos = require(appRoot + '/models/photos');

// helpers
const helpers = require(appRoot + '/libs/helpers');
const emailValidator = require('email-validator');
const sha = require('sha256');

// data
const fields = ['name', 'surname', 'email', 'phone', 'username', 'password', 'password-retype', 'privilege'];
const optionalFields = ['avatar'];

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
				token
			});
		});
	}, () => {
		res.status(404).json({
			message: "Incorrect username or password"
		});
	});
});

router.use(function (req, res, next) {
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
});

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
	});
});

router.get('/', function (req, res) {
	const keys = ['limit', 'offset', 'privilege'];
	let data = {};
	
	keys.forEach(key => {
		if(key in req.query) {
			data[key] = req.query[key];
		}
	});
	
	Users.getUsers(data).then(users => res.json(users));
});

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
		const path = `${appRoot}/front/build`;
		
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
				'message': 'User has been created'
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
	
	if(data.avatar) {
		Users.getUserById(id).then((user) => {
			const fileName = `/img/avatars/${sha(Date.now().toString())}`;
			const filePath = `${appRoot}/front/build`;
			Photos.deletePhoto(filePath, user.avatar);
			
			Photos.createPhoto(fileName, filePath, data.avatar).then(img => {
				data.avatar = img;
				editUser(id, data);
			}, err => res.status(403).json(err));
		});
	} else {
		editUser(id, data);
	}
	
	function editUser(id, data) {
		Users.editUser(id, data).then(user => {
			res.json({
				'message': 'User has been updated'
			});
		}, err => res.status(400).json(err));
	}
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
			Photos.deletePhoto(`${appRoot}/front/build`, user.avatar);
		}
		
		Users.deleteUser(id).then(id => res.json({
			'message': 'User deleted successfully'
		}), err => res.status(400).json(err));
	});
});

module.exports = router;