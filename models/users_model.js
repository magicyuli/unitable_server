var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//TODO
//var bcrypt = require('bcrypt');

var UsersSchema = new Schema({
	email: {type: String, unique: true, required: true},
    hashedPassword: {type: String, required: true},
    passwordResetToken: {type: String, unique: true},
    resetTokenExpires: {type: Date},
    firstname: {type: String},
    lastname: {type: String}
});

mongoose.model('Users', UsersSchema);

var UsersModel = mongoose.model('Users');

module.exports = {
	getUser: function(email, password, callback) {
		module.exports.authenticate(email, password, function(err, user) {
			if (err || ! user) {
				callback(err);
			} else {
				callback(null, user.email);
			}
		});
	},
	saveUser: function(user, callback) {
		var user = new UsersModel(user);
		user.save(callback);
	},
	authenticate: function(email, password, callback) {
		UsersModel.findOne({email: email}, function(err, user) {
			if (err || ! user) {
				callback(err);
			} else {
				//TODO
				callback(null, /*bcrypt.compareSync(password, user.hashed_password)*/password === user.hashedPassword ? user : null);
			}
		});
	}
};

