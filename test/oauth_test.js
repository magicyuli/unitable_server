var request = require('supertest');
var assert = require('assert');

var app = require('./../app.js');
var models = require('./../models');

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
				assert(res.body.access_token, "access_token wasn't set");
		        assert(res.body.refresh_token, "refresh_token wasn't set");
		        accessToken = res.body.access_token;
		        refreshToken = res.body.refresh_token;
		
				done();
			});
	});

	it("should allow logged in user to view the secret page", function(done) {
		request(app)
			.get('/secret')
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
		        username: 'test@unitable.com',
		        password: 'testpassword',
		        refresh_token: refreshToken
			})
			.expect(200)
			.end(function(req, res) {
				assert(res.body.access_token, "access_token wasn't set");
		        assert(res.body.refresh_token, "refresh_token wasn't set");
		        accessToken = res.body.access_token;
		        refreshToken = res.body.refresh_token;

				done();
			});
	});

	it.skip('should forbid access with an expired access token', function(done) {
	    var getAccessToken = models.oAuthModel.getAccessToken;
	    var saveAccessToken = models.oAuthModel.saveAccessToken;

	    getAccessToken(accessToken, function(err, token) {
	        saveAccessToken(token.accessToken, token.clientId, new Date(1), token.userId, function(err, doc, conut) {
	        	console.log(doc);
	            request(app)
		            .get('/secret')
		            .set('Authorization', 'Bearer ' + accessToken)
		            .expect(401, done);
	        });
	    });
    });

});