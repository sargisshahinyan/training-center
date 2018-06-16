const express= require('express');
const router = express.Router();

// models
const Subjects = require(appRoot + '/models/subjects');

// helpers
const helpers = require(appRoot + '/libs/helpers');

// data for subjects
const fields = ['name'];

// middleware
const authCheckingMiddleware = require(`${appRoot}/middlewares/authCheckingMiddleware`);

router.use(authCheckingMiddleware);

router.get('/', function (req, res) {
	const keys = ['limit', 'offset'];
	let data = {};
	
	keys.forEach(key => {
		if(key in req.query) {
			data[key] = req.query[key];
		}
	});
	
	Subjects.getSubjects(data).then(subjects => res.json(subjects));
});

router.get('/:id', function(req, res) {
	const id = Number(req.params.id);
	
	if(isNaN(id)) {
		res.status(403).json({
			message: 'Invalid id'
		});
		return;
	}
	
	Subjects.getSubject(id).then(subject => res.json(subject), err => res.status(404).json(err));
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
	
	Subjects.addSubject(data).then(subject => {
		res.status(201).json({
			'message': 'Subject has been created'
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
	
	Subjects.editSubject(id, data).then(subject => {
		res.json({
			'message': 'Subject has been updated'
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
	
	Subjects.deleteSubject(id).then(id => res.json({
		'message': 'Subject deleted successfully'
	}), err => res.status(400).json(err));
});

module.exports = router;