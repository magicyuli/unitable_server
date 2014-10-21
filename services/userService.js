var crypto = require('crypto');
var debug = require('debug')('dev');

var UsersModel = require('../models').UsersModel;

exports.authenticate = function(data, callback) {
	callback = callback || function(err) {};
	if (!(data.email && data.password)) {
		callback(new Error('Email/Password is required'));
		return;
	}
	debug('Fetching user: ' + data.email);
	UsersModel.findOne({ email: data.email }, function(err, user) {
		if (err) {
			callback(err);
		} else if(!user) {
			callback(null, null, 'Cannot find user');
		} else {
			var hash = crypto.createHash('md5').update(data.password).digest('base64');
			if(hash !== user.hashedPassword) {
				callback(null, null, 'Invalid password');
			} else {
				callback(null, user, 'Success');
			}
		}
	});
};

exports.getUser = function(data, callback) {
	exports.authenticate(data, function(err, user, message) {
		debug(message);
		if (err || !user) {
			callback(err);
		} else {
			callback(null, user);
		}
	});
};

exports.saveUser = function(data, callback) {
	new UsersModel(data).save(callback);
};