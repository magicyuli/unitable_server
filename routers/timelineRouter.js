var router = require('express').Router();

var eventListService = require('../services/eventListService');

router.route('/timeline')
	.get(function(req, res, next) {
		eventListService.getTimeline(
			req.param('startFrom'),
			req.param('skip'),
			req.param('limit'),
			req.param('orderBy'),
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