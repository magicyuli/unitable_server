var models = require('../models');
var config = require('../config');

var PostsModel = models.PostsModel;
var UsersModel = models.UsersModel;
var DishesModel = models.DishesModel;

function _getEvents (startFrom, skip, limit, orderBy, hostId, guestId, callback) {
	skip = skip || 0;
	limit = limit || config.defaultEventListSize;
	orderBy = orderBy || '-date';

	var queryObj = {};

	startFrom && (queryObj['date'] = { $gt: startFrom });
	hostId && (queryObj['host'] = hostId);
	guestId && (queryObj['guests'] = { $in: [guestId] });

	PostsModel
		.find(queryObj, null, {skip: skip, limit: limit, sort: orderBy})
		.populate({
			path: 'host',
			select: 'name email avatar phone address gender'
		})
		.populate({
			path: 'dishes',
			select: 'name description pictures'
		})
		.populate({
			path: 'guests',
			select: 'name email avatar phone address gender'
		})
		.exec(function(err, posts) {
			if (err) {
				callback(err);
			} else {
				callback(null, posts);
			}
		});
}

function getTimeline (skip, limit, orderBy, callback) {
	_getEvents (new Date().toLocaleDateString(), skip, limit, orderBy, null, null, callback);
}

function getHostEvents (skip, limit, orderBy, userId, callback) {
	_getEvents(null, skip, limit, orderBy, userId, null, callback);
}

function getGuestEvents (skip, limit, orderBy, guestId, callback) {
	_getEvents(null, skip, limit, orderBy, null, guestId, callback);
}

exports.getTimeline = getTimeline;
exports.getHostEvents = getHostEvents;
exports.getGuestEvents = getGuestEvents;