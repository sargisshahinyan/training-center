const express= require('express');
const router = express.Router();

// models
const Groups = require(appRoot + '/models/groups');

// helpers
const helpers = require(appRoot + '/libs/helpers');

// data for groups
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
	
	Groups.getGroups(data).then(groups => res.json(groups));
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
	
	Groups.addGroup(data).then(group => {
		res.status(201).json({
			'message': 'Group has been created'
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
	
	Groups.editGroup(id, data).then(group => {
		res.json({
			'message': 'Group has been updated'
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