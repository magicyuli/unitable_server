var spawn = require('child_process').spawn;
var request = require('supertest');
var assert = require('assert');
var connection = require('mongoose').connection;

var app = require('../app');
var config = require('../config');
var oauthService = require('../services/oauthService');

var fixtures = {
  	clients: [{
    	clientId: config.clientId,
    	clientSecret: config.clientSecret,
    	redirectUri: '/oauth/redirect',
    	grantTypes: ['password', 'refresh_token']
  	}]
};

describe("REGISTER TEST", function() {

	before(function(done) {
		if (connection.readyState !== 1) {
		  	connection.on('open', onReady);
	    } else {
	    	onReady();
	    }

	  	function onReady () {
		    connection.db.dropDatabase(function() {
		        oauthService.saveClient(fixtures.clients[0], done);
		    });
	  	};
	});

	it("should not allow GET request for /register", function(done) {
		request(app)
			.get('/register')
			.expect(405, done);
	});

	it("should save user and return user info and tokens", function(done) {
		var server;
		try {
			server = spawn('node', ['server.js'], {stdio: 'inherit'});
		} catch(err) {
			server = spawn('nodejs', ['server.js'], {stdio: 'inherit'});
		}
		request(app)
			.post('/register')
			.type('form')
			.send({
				email: 'test@cmu.edu',
				name: 'Lee',
				password: 'testpassword',
				gender: 1,
				phone: '0416723849',
				address: '12345 Tower KW St. SA 5000'
			})
			.expect(200)
			.end(function(err, res) {
				var data = res.body;
				assert(data.user, "user doesn't exist");
				assert(!data.user.password, "password shouldn't be sent back");
				assert.equal(data.user.email, 'test@cmu.edu', "user info is wrong");
				assert(data.tokens, "tokens doesn't exist");
				assert(data.tokens.access_token, "access token doesn't exist");
				assert(data.tokens.refresh_token, "refresh token doesn't exist");

				server.unref();
				done();
			});
	});
});