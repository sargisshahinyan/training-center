const express = require('express');
const router = express.Router();

const DateTime = require(`${appRoot}/models/dateTime`);

router.get('/weekDays', function (req, res) {
	DateTime.getWeekDays().then(days => res.json(days), err => res.status(500).json(err));
});

module.exports = router;