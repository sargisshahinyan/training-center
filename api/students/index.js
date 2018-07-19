const express= require('express');
const router = express.Router();

// models
const Students = require(APP_PATH + '/models/students');

// helpers
const helpers = require(APP_PATH + '/libs/helpers');

// data for students
const fields = ['name', 'surname', 'phone'];
const optionalFields = ['remark'];

// middleware
const authCheckingMiddleware = require(`${APP_PATH}/middlewares/authCheckingMiddleware`);
const adminPermissionMiddleware = require(`${APP_PATH}/middlewares/adminPermissionMiddleware`);

router.use(authCheckingMiddleware, adminPermissionMiddleware);

router.get('/', function (req, res) {
	const keys = ['limit', 'offset', 'filter'];
	let data = {};
	
	keys.forEach(key => {
		if(key in req.query) {
			data[key] = Number(req.query[key]);
		}
	});
	
	switch (data.filter) {
		case 2:
			Students.getPendingStudents().then(students => res.json(students));
			break;
		default:
			Students.getStudents(data).then(students => res.json(students));
			break;
	}
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
	optionalFields.forEach(field => {
		if(field in req.body) {
			data[field] = req.body[field];
		}
	});
	
	Students.addStudent(data).then(student => {
		res.status(201).json({
			'message': 'Student has been created successfully'
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
	optionalFields.forEach(field => {
		if(field in req.body) {
			data[field] = req.body[field];
		}
	});
	
	if('archived' in req.body && !isNaN(req.body.archived)) {
		data.archived = req.body.archived;
	}
	
	Students.editStudent(id, data).then(() => {
		res.json({
			'message': 'Student has been updated successfully'
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