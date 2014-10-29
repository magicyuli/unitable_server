var router = require('express').Router();

var eventListService = require('../services/eventListService');

router.route('/timeline')
	.get(function(req, res, next) {
		eventListService.getTimeline(
			req.query.skip,
			req.query.limit,
			req.query.orderBy,
			function(err, docs) {
				if (err)
					console.log(err);
				else 
					res.json(docs);
			});
	})
	.post(function(req, res) {
		res.status(405).end();
	});

module.exports = router;