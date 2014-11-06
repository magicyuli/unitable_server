var request = require('supertest');
var assert = require('assert');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var app = require('../app');
var userService = require('../services/userService');
var models = require('../models');
var PostsModel = models.PostsModel;
var DishesModel = models.DishesModel;

var connection = mongoose.connection;

var TEST_DOC_NUM = 20;

var fixtures = {
	user: {
		_id: new ObjectId('hosthosthost'),
    	email: 'test@cmu.edu',
    	password: 'testpassword',
    	name: "Lee",
    	gender: 1
  	},

  	post: {
    	date: new Date("01/01/2020"),
		location: "12345 Tower KW St. SA 5000",
		host: new ObjectId('hosthosthost'),
		dishes: [new ObjectId('dishdishdish'), new ObjectId('dishdishdish'), new ObjectId('dishdishdish')],
		maxGuestNum: 10
  	},

  	dish: {
  		_id: new ObjectId('dishdishdish'),
  		name: "kon-po chicken",
    	description: "superior",
		pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO', '4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO']
  	}
};

describe("TIMELINE TEST", function() {

	before(function(done) {
		if (connection.readyState !== 1) {
		  	connection.on('open', onReady);
	    } else {
	    	onReady();
	    }

	  	function onReady () {
	  		connection.db.dropDatabase(function() {
		      	userService.saveUser(fixtures.user, function() {
		        	new DishesModel(fixtures.dish).save(function(err, doc) {
		        		var posts = [];
		        		for (var i = 0; i < TEST_DOC_NUM; i++) {
		        			posts.push(fixtures.post);
		        		}
		        		PostsModel.create(posts, done);
		        	});
		      	});
		    });
	  	}
	});

	it("should be requested without login", function(done) {
		request(app)
			.get('/timeline')
			.expect(200, done);
	});

	it("should block post request", function(done) {
		request(app)
			.post('/timeline')
			.expect(405, done);
	});

	it("should respond with proper results without request params", function(done) {
		request(app)
			.get('/timeline')
			.expect(200)
			.end(function(err, res) {
				var data = res.body;
				assert.equal(data.length, 10, "number of results is not right");
				assert.equal(data[0].dishes.length, 3, "number of dishes is not right");
				assert.equal(data[0].dishes[0].description, "superior", "dishes are not properly retrieved");
				assert.equal(data[0].host.email, "test@cmu.edu", "host is not properly retrieved");

				done();
			});
	});

	it("should respond with proper results with skip", function(done) {
		request(app)
			.get('/timeline?skip=19')
			.expect(200)
			.end(function(err, res) {
				var data = res.body;
				//based on TEST_DOC_NUM
				assert(data.length, 1, "number of results is not right");

				done();
			});
	});

	it("should respond with proper results with limit", function(done) {
		request(app)
			.get('/timeline?limit=3')
			.expect(200)
			.end(function(err, res) {
				var data = res.body;
				//based on TEST_DOC_NUM
				assert.equal(data.length, 3, "number of results is not right");

				done();
			});
	});

	it("should respond with proper results with both skip and limit", function(done) {
		request(app)
			.get('/timeline?skip=15&limit=10')
			.expect(200)
			.end(function(err, res) {
				var data = res.body;
				//based on TEST_DOC_NUM
				assert.equal(data.length, 5, "number of results is not right");

				done();
			});
	});
});