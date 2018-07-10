const express= require('express');
const router = express.Router();

// models
const Groups = require(APP_PATH + '/models/groups');

// helpers
const helpers = require(APP_PATH + '/libs/helpers');

// data for groups
const fields = ['name', 'userId', 'subjectId', 'students', 'days'];

// middleware
const authCheckingMiddleware = require(`${APP_PATH}/middlewares/authCheckingMiddleware`);
const adminPermissionMiddleware = require(`${APP_PATH}/middlewares/adminPermissionMiddleware`);

router.use(authCheckingMiddleware);

router.get('/all', function (req, res) {
	Groups.getFullGroups().then(groups => res.json(groups), err => res.status(500).json(err));
});

router.use(adminPermissionMiddleware);

router.get('/', function (req, res) {
	const keys = ['limit', 'offset'];
	let data = {};
	
	keys.forEach(key => {
		if(key in req.query) {
			data[key] = req.query[key];
		}
	});
	
	Groups.getGroups(data).then(groups => res.json(groups), err => res.status(500).json(err));
});

router.get('/:id', function(req, res) {
	const id = Number(req.params.id);
	
	if(isNaN(id)) {
		res.status(403).json({
			message: 'Invalid id'
		});
		return;
	}
	
	Groups.getGroup(id).then(group => res.json(group), err => res.status(404).json(err));
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
	
	if(!Array.isArray(data.students) || data.students.some(student => isNaN(Number(student)))) {
		res.status(403).json({
			'message': `Invalid parameter students`
		});
		return;
	}
	
	if(!Array.isArray(data.days) || data.days.some(day => isNaN(Number(day.weekDay)) || !helpers.isTimeValid(day.startsAt))) {
		res.status(403).json({
			'message': `Invalid parameter days`
		});
		return;
	}
	
	Groups.addGroup(data).then(group => {
		res.status(201).json({
			'message': 'Group has been created successfully'
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
	
	if(!Array.isArray(data.students) || data.students.find(student => isNaN(Number(student))) !== undefined) {
		res.status(403).json({
			'message': `Invalid parameter students`
		});
		return;
	}
	
	Groups.editGroup(id, data).then(group => {
		res.json({
			'message': 'Group has been updated successfully'
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
	
	Groups.deleteGroup(id).then(id => res.json({
		'message': 'Group deleted successfully'
	}), err => res.status(400).json(err));
});

module.exports = router;