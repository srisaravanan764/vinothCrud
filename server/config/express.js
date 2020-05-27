/**
 * Express configuration
 */

'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
const path = require('path');
const config = require('./environment');
//const passport = require('passport');

module.exports = function(app) {
	const env = app.get('env');

	app.use(compression());
	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use(bodyParser.json());
	app.use(expressValidator([]));
	app.use(methodOverride());
	app.use(cookieParser());
	//app.use(passport.initialize());

	if ('production' === env || 'test' === env) {
		// app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
		app.use(express.static(path.join(config.root, 'public')));
		app.set('appPath', config.root + '/public');
		app.use(morgan('dev'));
	}

	if ('development' === env) {
		app.use(require('connect-livereload')());
		app.use(express.static(path.join(config.root, '.tmp')));
		app.use(morgan('dev'));
		app.use(errorHandler()); // Error handler - has to be last
	}
};