var request = require('supertest');
var assert = require('assert');

var app = require('./../app.js');

describe("OAuth test", function() {
	var accessToken;
	var refreshToken;
	var clientId = "unitableself";
	var clientSecret = "9a5667gfn5h434df7dh8f99";
	var clientCredentials = new Buffer(clientId + ":" + clientSecret).toString('base64');

	it("should allow accessToken to be requested by password grant", function(done) {
		request(app)
			.post('/oauth/token')
			.type('form')
			.set('Authorization', 'Basic ' + clientCredentials)
			.send({
				grant_type: 'password',
		        username: 'test@unitable.com',
		        password: 'testpassword',
			})
			.expect(200)
			.end(function(err, res) {
				assert(res.body.access_token, 'Ensure the access_token was set');
		        assert(res.body.refresh_token, 'Ensure the refresh_token was set');
		        accessToken = res.body.access_token;
		        refreshToken = res.body.refresh_token;
		
				done();
			});
	});

});