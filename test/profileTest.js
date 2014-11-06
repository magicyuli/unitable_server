var request = require('supertest');
var assert = require('assert');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var connection = mongoose.connection;

var config = require('../config');
var app = require('../app');
var userService = require('../services/userService');
var oauthService = require('../services/oauthService');

var fixtures = {
	users: [{
    	email: 'test@andrew.cmu.edu',
    	password: 'testpassword',
    	name: "Lee",
    	gender: 1,
    	address: "12345 Tower KW St. SA 5000",
    	phone: "0415342934"
  	},
  	{
  		_id: new ObjectId('hosthosthost'),
    	email: 'daryl@andrew.cmu.edu',
    	password: 'testpassword',
    	name: "Daryl",
    	gender: 1,
    	address: "12345 House SA 5000",
    	phone: "0415593934"
  	}],
  	client: {
    	clientId: config.clientId,
    	clientSecret: config.clientSecret,
    	redirectUri: '/oauth/redirect',
    	grantTypes: ['password', 'refresh_token']
  	}
};

describe("PROFILE TEST", function() {
	var accessToken;

	before(function(done) {
		if (connection.readyState !== 1) {
			connection.on('open', onReady);
		} else {
			onReady();
		}

		function onReady () {
			connection.db.dropDatabase(function() {
				oauthService.saveClient(fixtures.client, function() {
					userService.saveUser(fixtures.users[0], function() {
						userService.saveUser(fixtures.users[1], function() {
							request(app)
								.post('/oauth/token')
								.type('form')
								.set('Authorization', 'Basic ' + config.clientCredentials)
								.send({
									grant_type: 'password',
									username: 'test@andrew.cmu.edu',
									password: 'testpassword'
								})
								.expect(200)
								.end(function(err, res) {
									assert(res.body.access_token, "request token failed");
									accessToken = res.body.access_token;

									done();
								});
						});
					});
				});
			});
		}
	});

	it("should respond with self profile", function(done) {
		request(app)
			.get('/member/profile')
			.set('Authorization', 'Bearer ' + accessToken)
			.expect(200)
			.end(function(err, res) {
				assert(res.body, "profile retrieve failed");
				assert.equal(res.body.address, "12345 Tower KW St. SA 5000", "user profile is wrong");
				assert(!res.body.password, "password shouldn't be returned");
				assert(res.body.dishes, "should return dishes");

				done();
			});
	});

	it("should respond with designated user profile", function(done) {
		request(app)
			.get('/member/profile?id=' + new ObjectId('hosthosthost').toString())
			.set('Authorization', 'Bearer ' + accessToken)
			.expect(200)
			.end(function(err, res) {
				var profile = res.body;
				assert(profile, "profile retrieve failed");
				assert.equal(profile.address, "12345 House SA 5000", "another user profile is wrong");
				assert(!profile.dishes, "shouldn't return other's dishes");

				done();
			});
	});

	it("should update self profile and return the new profile", function(done) {
		request(app)
			.post('/member/profile')
			.set('Authorization', 'Bearer ' + accessToken)
			.type('form')
			.send({
				name: "Yu",
				phone: "0123456789",
				address: "new address"
			})
			.expect(200)
			.end(function(err, res) {
				var profile = res.body;
				assert(profile, "profile retrieve failed");
				assert.equal(profile.address, "new address", "new address is wrong");
				assert.equal(profile.name, "Yu", "new name is wrong");
				assert.equal(profile.phone, "0123456789", "new phone is wrong");
				assert(!profile.password, "password shouldn't be returned");

				done();
			});
	});

	it("should prevent unauthorized user get profile", function(done) {
		request(app)
			.get('/member/profile')
			.expect(400, done);
	});
});