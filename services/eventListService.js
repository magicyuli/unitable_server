var models = require('../models');
var config = require('../config');

var PostsModel = models.PostsModel;
var UsersModel = models.UsersModel;
var DishesModel = models.DishesModel;

function _getEvents (startFrom, skip, limit, orderBy, hostId, postIds, callback) {
	startFrom = startFrom || new Date();
	skip = skip || 0;
	limit = limit || config.defaultEventListSize;
	orderBy = orderBy || 'date';

	var queryObj = {
		date: { $gt: startFrom }
	};

	hostId && (queryObj['host'] = hostId);
	postIds && (queryObj['_id'] = {$in: postIds});

	PostsModel
		.find(queryObj, null, {skip: skip, limit: limit, sort: orderBy})
		.populate({
			path: 'host',
			select: 'name email'
		})
		.populate({
			path: 'dishes',
			select: 'name description pictures'
		})
		.exec(function(err, posts) {
			if (err) {
				callback(err);
			} else {
				callback(null, posts);
			}
		});
}

function getTimeline (startFrom, skip, limit, orderBy, callback) {
	_getEvents (startFrom, skip, limit, orderBy, null, null, callback);
}

function getHostEvents (startFrom, skip, limit, orderBy, userId, callback) {
	_getEvents(startFrom, skip, limit, orderBy, userId, null, callback);
}

function getGuestEvents (startFrom, skip, limit, orderBy, userId, callback) {
	UsersModel.findOne({_id: userId}, 'guestEvents', function(err, doc) {
		if (err)
			callback(err);
		else
			_getEvents(startFrom, skip, limit, orderBy, userId, doc.guestEvents, callback);
	});
}

exports.getTimeline = getTimeline;
exports.getHostEvents = getHostEvents;
exports.getGuestEvents = getGuestEvents;