var request = require('supertest');
var assert = require('assert');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var config = require('../config');
var app = require('../app');
var userService = require('../services/userService');
var oauthService = require('../services/oauthService');
var models = require('../models');
var PostsModel = models.PostsModel;
var DishesModel = models.DishesModel;

var connection = mongoose.connection;

var TEST_DOC_NUM = 20;

var fixtures = {
	hostUser: {
		_id: new ObjectId('hosthosthost'),
    	email: 'host@cmu.edu',
    	password: 'testpassword',
    	name: "Lee",
    	gender: 1
  	},
  	guestUser: {
		_id: new ObjectId('guestguestst'),
    	email: 'guest@cmu.edu',
    	password: 'testpassword',
    	name: "Yu",
    	gender: 1,
  	},
  	client: {
    	clientId: config.clientId,
    	clientSecret: config.clientSecret,
    	redirectUri: '/oauth/redirect',
    	grantTypes: ['password', 'refresh_token']
  	},
  	post: {
    	date: new Date(),
		location: "12345 Tower KW St. SA 5000",
		host: new ObjectId('hosthosthost'),
		dishes: [new ObjectId('dishdishdish'), new ObjectId('dishdishdish'), new ObjectId('dishdishdish')],
		guests: [new ObjectId('guestguestst'), new ObjectId('123123123123'), new ObjectId('234234234234')],
		maxGuestNum: 10
  	},
  	dish: {
  		_id: new ObjectId('dishdishdish'),
  		name: "kon-po chicken",
    	description: "superior",
		pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO', '4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO']
  	}
};

describe("PERSONAL TIMELINE TEST", function() {
	var hostAccessToken;
	var guestAccessToken;

	before(function(done) {
		if (connection.readyState !== 1) {
		  	connection.on('open', onReady);
	    } else {
	    	onReady();
	    }

	  	function onReady () {
	  		connection.db.dropDatabase(function() {
	  			oauthService.saveClient(fixtures.client, function() {
			      	userService.saveUser(fixtures.hostUser, function() {
			      		userService.saveUser(fixtures.guestUser, function() {
				        	new DishesModel(fixtures.dish).save(function(err, doc) {
				        		var posts = [];
				        		for (var i = 0; i < TEST_DOC_NUM; i++) {
				        			posts.push(fixtures.post);
				        		}
				        		PostsModel.create(posts, function() {
									request(app)
										.post('/oauth/token')
										.type('form')
										.set('Authorization', 'Basic ' + config.clientCredentials)
										.send({
											grant_type: 'password',
											username: 'host@cmu.edu',
											password: 'testpassword'
										})
										.expect(200)
										.end(function(err, res) {
											assert(res.body.access_token, "request token failed");
											hostAccessToken = res.body.access_token;

										});

									request(app)
										.post('/oauth/token')
										.type('form')
										.set('Authorization', 'Basic ' + config.clientCredentials)
										.send({
											grant_type: 'password',
											username: 'guest@cmu.edu',
											password: 'testpassword'
										})
										.expect(200)
										.end(function(err, res) {
											assert(res.body.access_token, "request token failed");
											guestAccessToken = res.body.access_token;

											done();
										});
								});
				        	});
				        });
			      	});
			    });
		    });
	  	}
	});

	it("should return guest posts", function(done) {
		request(app)
			.get('/member/timeline/guest?startFrom=01/01/1970')
			.set('Authorization', 'Bearer ' + guestAccessToken)
			.expect(200)
			.end(function(err, res) {
				var posts = res.body;
				assert.equal(posts.length, config.defaultEventListSize, "number of returned posts is wrong");

				done();
			});
	});

	it("should return host posts", function(done) {
		request(app)
			.get('/member/timeline/host?startFrom=01/01/1970')
			.set('Authorization', 'Bearer ' + hostAccessToken)
			.expect(200)
			.end(function(err, res) {
				var posts = res.body;
				assert.equal(posts.length, config.defaultEventListSize, "number of returned posts is wrong");

				done();
			});
	});

});