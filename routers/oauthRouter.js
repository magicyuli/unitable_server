var router = require('express').Router();
var oauthserver = require('node-oauth2-server');
var debug = require('debug');

var oauthService = require('../services/oauthService');
var UserService = require('../services/UserService')

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

router.route('/member(()|(/*))')
	.all(oauth.authorise(), function(req, res, next) {
		if (req.path === '/member')
			res.status(200).send();
		else {
			if (req.user && req.user.id) {
				var _oldUser = req.user;
				UserService.getUserById({ id: _oldUser.id }, function(err, user) {
					debug(err);
					debug(user);
					req.user = user;
					return next(err);
				});
			}
		}
	});

module.exports = router;