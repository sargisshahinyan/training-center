const express= require('express');
const router = express.Router();

const routes = ['/users', '/students', '/subjects', '/groups'];

routes.forEach(route => router.use(route, require(`.${route}`)));

module.exports = router;