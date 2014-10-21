var router = require('express').Router();

router.route('/timeline')
	.get(function(req, res, next) {
		// param
		res.status(200).send();
	})
	.post(function(req, res) {
		// param
		res.status(405).end();
	});

module.exports = router;