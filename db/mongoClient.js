'use strict';

var mongo = require('mongodb');

var db;

mongo.MongoClient.connect('mongodb://testdba:testadmin@localhost:27017/test',	function(err, database) {
	if (err) throw err;
	db = database;
});

function insert (collection, data, callback) {
	var collection = db.collection(collection);
	if (typeof callback === "function") {
		collection.insert(data, {w: 1}, callback);
	} else {
		collection.insert(data, {w: 1}, function(err, doc) {
			if (err) {
				console.warn(err);
			} else {
				console.log("inserted successfully:");
				console.dir(doc);
			}
		});
	}
}

function findOne (collection, criteria, fields, options, callback) {
	findProxy('findOne', collection, criteria, fields, options, callback);
}

function findEach (collection, criteria, fields, options, callback) {
	findProxy('findEach', collection, criteria, fields, options, callback);
}

function findAll (collection, criteria, fields, options, callback) {
	findProxy('findAll', collection, criteria, fields, options, callback);
}

function _findProxy (_type, collection, criteria, fields, options, callback) {
	var collection = db.collection(collection);
	var _fields = fields || {};
	var _options = options || {};
	if (typeof callback === "function") {
		switch (_type) {
			case 'findOne':
				collection.findOne(criteria, _fields, _options, callback);
				break;
			case 'findEach':
				collection.find(criteria, _fields, _options).each(callback);
				break;
			case 'findAll':
				collection.find(criteria, _fields, _options).toArray(callback);
				break;
		};
	} else {
		console.warn("please provide appropriate callback function!");
	}
}

exports.insert = insert;
exports.findOne = findOne;
exports.findEach = findEach;
exports.findAll = findAll;

