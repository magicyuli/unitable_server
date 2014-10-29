var router = require('express').Router();

var eventListService = require('../services/eventListService');

var fnMapper = {
	host: eventListService.getHostEvents,
	guest: eventListService.getGuestEvents
};

router.route('/member/timeline/:type')
	.get(function(req, res, next) {
		var type = req.params.type;
		if (!type in ['host', 'guest']) {
			res.status(400).send(type + " is not a valid type");
			return;
		}
		fnMapper[type](
			req.query.skip,
			req.query.limit,
			req.query.orderBy,
			req.user.id,
			function(err, docs) {
				if (err) {
					next(err);
				} else {
					res.json(docs);
				}
			});
	})
	.post(function(req, res, next) {
		res.status(405).end();
	});

module.exports = router;