const express= require('express');
const router = express.Router();

// models
const Students = require('../../models/students');
const Users = require('../../models/users');

// helpers
const helpers = require('../../libs/helpers');

// data for students
const fields = ['name', 'surname', 'phone'];

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

router.get('/', function (req, res) {
	const keys = ['limit', 'offset'];
	let data = {};
	
	keys.forEach(key => {
		if(key in req.query) {
			data[key] = req.query[key];
		}
	});
	
	Students.getStudents(data).then(students => res.json(students));
});

router.get('/:id', function(req, res) {
	const id = Number(req.params.id);
	
	if(isNaN(id)) {
		res.status(403).json({
			message: 'Invalid id'
		});
		return;
	}
	
	Students.getStudent(id).then(student => res.json(student), err => res.status(404).json(err));
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
	
	const data = {};
	
	fields.forEach(field => data[field] = req.body[field]);
	
	Students.addStudent(data).then(student => {
		res.status(201).json({
			'message': 'Student has been created'
		});
	}, err => res.status(400).json(err));
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
	
	Students.editStudent(id, data).then(student => {
		res.json({
			'message': 'Student has been updated'
		});
	}, err => res.status(400).json(err));
});

router.delete('/:id', function (req, res) {
	const id = Number(req.params.id);
	
	if(isNaN(id)) {
		res.status(403).json({
			message: 'Invalid id'
		});
		return;
	}
		
	Students.deleteStudent(id).then(id => res.json({
		'message': 'Student deleted successfully'
	}), err => res.status(400).json(err));
});

module.exports = router;