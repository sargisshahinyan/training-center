const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();
global.APP_PATH = path.resolve(__dirname);

const staticRoutes = [
	'/home', '/users', '/students', '/subjects', '/groups', '/timetable'
];
const helpers = require(APP_PATH + '/libs/helpers');

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(require('cors')());

app.use(function (req, res, next) {
	helpers.trim(req.query);
	helpers.trim(req.body);
	next();
});
app.use(express.static(path.join(__dirname, 'front', 'build')));

staticRoutes.forEach(route => app.use(route, express.static(path.join(__dirname, 'front', 'build', 'index.html'))));

app.use('/api', require('./api'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error ' + err.status);
});

module.exports = app;