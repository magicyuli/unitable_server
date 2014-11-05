var winston = require('winston');
var configs = require('../config');

winston.emitErrs = true;

var loggers = {};

loggers['others'] = new winston.Logger({
	transports: [
		new (winston.transports.File)({
			filename: configs.regularLogPath, level: 'debug',
			handleExceptions: false,
			maxsize: 5242880, //5MB
            maxFiles: 5,
		}),
		new (winston.transports.Console)({
			level: 'debug',
			colorize: true,
			handleExceptions: false,
			json: false
		})
	],
	exitOnError: false
});

loggers['error'] = new winston.Logger({
	transports: [
		new (winston.transports.File)({
			filename: configs.errorLogPath, level: 'error',
			handleExceptions: true,
			maxsize: 5242880, //5MB
            maxFiles: 5,
		}),
		new (winston.transports.Console)({
			level: 'error',
			colorize: true,
			handleExceptions: false,
			json: false
		})
	],
	exitOnError: false
});

module.exports = {
	debug: function(msg){
		loggers.others.debug(msg);
	},
	info: function(msg){
		loggers.others.info(msg);
	},
	warn: function(msg){
		loggers.others.warn(msg);
	},
	error: function(msg){
		loggers.error.error(msg);
	},
	log: function(level,msg){
		module.exports[level](msg);
	}
};

module.exports.stream = {
	write: function(message, encoding){
		loggers.others.info(message);
	}
};