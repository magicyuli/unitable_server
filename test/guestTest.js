var request = require('supertest');
var assert = require('assert');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var config = require('../config');
var logger = require('../utils/logger');
var app = require('../app');
var userService = require('../services/userService');
var oauthService = require('../services/oauthService');
var models = require('../models');
var PostsModel = models.PostsModel;
var DishesModel = models.DishesModel;

var connection = mongoose.connection;

var fixtures = {
	hostUser: {
		_id: new ObjectId('hosthosthost'),
    	email: 'host@cmu.edu',
    	password: 'testpassword',
    	name: "Lee",
    	gender: 1
  	},
  	guestUsers: [{
		_id: new ObjectId('guestguest11'),
    	email: 'guest1@cmu.edu',
    	password: 'testpassword',
    	name: "Yu",
    	gender: 1,
  	},
  	{
		_id: new ObjectId('guestguest22'),
    	email: 'guest2@cmu.edu',
    	password: 'testpassword',
    	name: "Yu",
    	gender: 1,
  	}],
  	client: {
    	clientId: config.clientId,
    	clientSecret: config.clientSecret,
    	redirectUri: '/oauth/redirect',
    	grantTypes: ['password', 'refresh_token']
  	},
  	post: {
  		_id: new ObjectId('postpostpost'),
    	date: new Date("01/01/2020"),
		location: "12345 Tower KW St. SA 5000",
		host: new ObjectId('hosthosthost'),
		dishes: [new ObjectId('dishdishdish'), new ObjectId('dishdishdish'), new ObjectId('dishdishdish')],
		guests: [],
		maxGuestNum: 1
  	},
  	dish: {
  		_id: new ObjectId('dishdishdish'),
  		name: "kon-po chicken",
    	description: "superior",
		pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO', '4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO']
  	}
};

describe("GUEST TEST", function() {
	var hostAccessToken;
	var guest1AccessToken;
	var guest2AccessToken;

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
			      		userService.saveUser(fixtures.guestUsers[0], function() {
			      			userService.saveUser(fixtures.guestUsers[1], function() {
					        	new DishesModel(fixtures.dish).save(function(err, doc) {
					        		new PostsModel(fixtures.post).save(function() {
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
												username: 'guest1@cmu.edu',
												password: 'testpassword'
											})
											.expect(200)
											.end(function(err, res) {
												assert(res.body.access_token, "request token failed");
												guest1AccessToken = res.body.access_token;

											});

										request(app)
											.post('/oauth/token')
											.type('form')
											.set('Authorization', 'Basic ' + config.clientCredentials)
											.send({
												grant_type: 'password',
												username: 'guest2@cmu.edu',
												password: 'testpassword'
											})
											.expect(200)
											.end(function(err, res) {
												assert(res.body.access_token, "request token failed");
												guest2AccessToken = res.body.access_token;

												done();
											});
									});
					        	});
							});
				        });
			      	});
			    });
		    });
	  	}
	});

	it("should add user to guest list of that very post", function(done) {
		request(app)
			.post('/member/guest')
			.type('form')
			.set('Authorization', 'Bearer ' + guest1AccessToken)
			.send({
				postId: new ObjectId('postpostpost').toString()
			})
			.expect(200)
			.end(function(err, res) {
				var post = res.body;
				assert.equal(post.message, "guesting succeeded", "guesting failed");
				done();
			});
	});

	it("should not add one user to a post twice", function(done) {
		request(app)
			.post('/member/guest')
			.type('form')
			.set('Authorization', 'Bearer ' + guest1AccessToken)
			.send({
				postId: new ObjectId('postpostpost').toString()
			})
			.expect(200)
			.end(function(err, res) {
				var post = res.body;
				assert.equal(post.message, "you've already guested this post: " + new ObjectId('postpostpost').toString(), "guesting failed");
				done();
			});
	});

	it("should not add user to his own post", function(done) {
		request(app)
			.post('/member/guest')
			.type('form')
			.set('Authorization', 'Bearer ' + hostAccessToken)
			.send({
				postId: new ObjectId('postpostpost').toString()
			})
			.expect(400)
			.end(function(err, res) {
				var post = res.body;
				assert.equal(post.message, "you don't need to guest your own post: " + new ObjectId('postpostpost').toString(), "something's wrong");

				done();
			});
	});

	it("should not let user guest if the maxGuestNum is reached", function(done) {
		request(app)
			.post('/member/guest')
			.type('form')
			.set('Authorization', 'Bearer ' + guest2AccessToken)
			.send({
				postId: new ObjectId('postpostpost').toString()
			})
			.expect(400)
			.end(function(err, res) {
				var post = res.body;
				assert.equal(post.message, "no available space for this post: " + new ObjectId('postpostpost').toString(), "something's wrong");

				done();
			});
	});

	it("should prevent POST request", function(done) {
		request(app)
			.get('/member/guest')
			.set('Authorization', 'Bearer ' + guest1AccessToken)
			.expect(405, done);
	});

});