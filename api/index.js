const express= require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/students', require('./students'));

module.exports = router;