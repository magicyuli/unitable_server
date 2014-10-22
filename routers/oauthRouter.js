var router = require('express').Router();
var oauthserver = require('node-oauth2-server');

var oauthService = require('../services/oauthService');

var oauth = oauthserver({
	model: oauthService,
	grants: ['password', 'refresh_token'],
	debug: true
});

router.route('/oauth/token')
	.post(oauth.grant())
	.get(function(req, res) {
		res.status(405).end();
	});

router.route('/oauth()|(/*)')
	.all(oauth.authorise(), function(req, res, next) {
			console.log(req.path);
		if (req.path === '/oauth')
			res.status(200).send();
		else
			next();
	});

module.exports = router;