var request = require('supertest');
var assert = require('assert');
var connection = require('mongoose').connection;

var app = require('../app');
var config = require('../config');
var userService = require('../services/userService');
var oauthService = require('../services/oauthService');

var fixtures = {
  	clients: [{
    	clientId: config.clientId,
    	clientSecret: config.clientSecret,
    	redirectUri: '/oauth/redirect',
    	grantTypes: ['password', 'refresh_token']
  	}],

  	users: [{
    	email: 'test@andrew.cmu.edu',
    	password: 'testpassword',
    	name: "Lee",
    	gender: 1
  	}]
};


describe("OAUTH TEST", function() {
	var accessToken;
	var refreshToken;
	var clientId = config.clientId;
	var clientSecret = config.clientSecret;
	var clientCredentials = config.clientCredentials;

	before(function(cb) {
		if (connection.readyState !== 1) {
		  	connection.on('open', onReady);
	    } else {
	    	onReady();
	    }

	  	function onReady () {
		    connection.db.dropDatabase(function() {
		      	userService.saveUser(fixtures.users[0], function() {
		        	oauthService.saveClient(fixtures.clients[0], cb);
		      	});
		    });
	  	};
	});

	it("should allow accessToken to be requested by password grant", function(done) {
		request(app)
			.post('/oauth/token')
			.type('form')
			.set('Authorization', 'Basic ' + clientCredentials)
			.send({
				grant_type: 'password',
				username: 'test@andrew.cmu.edu',
				password: 'testpassword',
			})
			.expect(200)
			.end(function(err, res) {
				assert(res.body.access_token, "access_token wasn't set");
				assert(res.body.refresh_token, "refresh_token wasn't set");
				accessToken = res.body.access_token;
				refreshToken = res.body.refresh_token;

				done();
			});
	});

	it("should prevent GET method for /oauth/token", function(done) {
		request(app)
			.get('/oauth/token')
			.expect(405, done);
	});

	it("should allow logged in user to view the secret page", function(done) {
		request(app)
			.get('/member')
			.set('Authorization', 'Bearer ' + accessToken)
			.expect(200, done);
	});

	it("should allow new access token to be requested with refresh token", function(done) {
		request(app)
			.post('/oauth/token')
			.type('form')
			.set('Authorization', 'Basic ' + clientCredentials)
			.send({
				grant_type: 'refresh_token',
				refresh_token: refreshToken
			})
			.expect(200)
			.end(function(err, res) {
				assert(res.body.access_token, "access_token wasn't set");
				assert(res.body.refresh_token, "refresh_token wasn't set");
				accessToken = res.body.access_token;
				refreshToken = res.body.refresh_token;

				done();
			});
	});

	it('should forbid access with an expired access token', function(done) {
	    var oAuthService = require('../services/oauthService.js');
	    oAuthService.getAccessToken(accessToken, function(err, token) {
	    	oAuthService.saveAccessToken(
	    		accessToken,
	    		token.clientId,
	    		new Date(1),
	    		token.userId,
	    		function(err, doc) {
	 					request(app)
	 					  .get('/member')
	 					  .set('Authorization', 'Bearer ' + accessToken)
	 					  .expect(401, done);
	  		});
		});

	});

});