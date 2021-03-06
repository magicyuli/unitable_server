var crypto = require('crypto');
var debug = require('debug')('dev');

var UsersModel = require('../models').UsersModel;

exports.validateNewUser = function(user) {
	var emailRegex = /^[a-z][0-9a-z]{2,34}@(andrew\.)?cmu\.edu$/i;
	var nameRegex = /^[0-9a-zA-Z_]{2,35}$/;
	var phoneRegex = /^\+?\d{10,11}$/;
	var passwordRegex = /^.{6,}$/;
	if (!user.email || !emailRegex.test(user.email)) {
		throw new Error("email invalid");
	}
	if (!user.name || !nameRegex.test(user.name)) {
		throw new Error("name invalid");
	}
	if (!user.password || !passwordRegex.test(user.password)) {
		throw new Error("password invalid");
	}
	if (!user.gender) {
		throw new Error("gender invalid");
	}
	if (user.phone && !phoneRegex.test(user.phone)) {
		throw new Error("phone invalid");
	}
};

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
			if(hash !== user.password) {
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

exports.getUserByEmail = function(data, callback) {
	if (!data.email) {
		callback(new Error('Email is required'));
		return;
	}
	UsersModel.findOne({ email: data.email }, callback);
};

exports.getUserById = function(data, callback) {
	data.id = data.id || data._id;
	if (!data.id) {
		callback(new Error('Id is required'));
		return;
	}
	UsersModel.findOne({ _id: data.id }, callback);
};

exports.saveUser = function(data, callback) {
	data.password = crypto.createHash('md5').update(data.password).digest('base64');
	new UsersModel(data).save(callback);
};

exports.updateUserById = function(data, callback) {
	if (!data.id) {
		callback(new Error("can't find user id tp update user"));
		return;
	}
	UsersModel.findOneAndUpdate({ _id: data.id }, data, callback);
};

exports.getProfileById = function(userId, callback) {
	if (!userId) {
		callback(new Error("can't find user id to get profile"));
		return;
	}
	UsersModel.findOne({ _id: userId }, '_id name email gender address phone avatar', callback);
};