var router = require('express').Router();
var request = require('request');

var config = require('../config');
var logger = require('../utils/logger');
var userService = require('../services/userService');

router.route('/register')
	.get(function(req, res, next) {
		res.status(405).end();
	})
	.post(function(req, res, next) {
		var user = {};

		user['email'] = req.body.email;
		user['name'] = req.body.name;
		user['password'] = req.body.password;
		user['originalPassword'] = req.body.password;
		user['gender'] = req.body.gender;
		user['avatar'] = req.body.avatar || null;
		user['phone'] = req.body.phone || null;
		user['address'] = req.body.address || null;

		try {
			userService.validateNewUser(user);
		} catch (err) {
			logger.info("userRouter.js:26");
			logger.error(err);
			return res.status(400).send(err.message);
		}
		
		userService.saveUser(user,
			function(err, doc) {
				if (err) {
					return next(err);
				}
				request({
					uri: 'http://localhost:8086/oauth/token',
					method: 'POST',
					headers: {
						'Authorization': 'Basic ' + config.clientCredentials
					},
					form: {
						grant_type: 'password',
						username: user.email,
						password: user.originalPassword
					},
					json: true
				}, function(err, resp, body) {
					if (err) {
						return next(err);
					}
					if (resp && resp.statusCode !== 200) {
						return res.status(resp.statusCode).send(resp.body);
					}
					doc.password = void 0;
					res.json({ user: doc, tokens: body });
				});
			});
	});

router.route('/member/profile')
	.get(function(req, res, next) {
		logger.info("userRouter.js:63:GET /member/profile");

		if (req.query.id) {
			logger.info("requesting profile of another user; user id " + req.query.id);

			userService.getProfileById(req.query.id, function(err, doc) {
				if (err) {
					next(err);
					return;
				}
				res.json(doc);
			});
		} else if (req.user.id) {
			logger.info("requesting profile of self; user id " + req.user.id);
			req.user.password = void 0;
			res.json(req.user);
		} else {
			next(new Error("can't find user id required"));	
		}
	})
	.post(function(req, res, next) {
		var user = {};
		if (!req.user.id) {
			next(new Error("can't find user"));
			return;
		}
		user['id'] = req.user.id;
		req.body.name && (user['name'] = req.body.name);
		req.body.avatar && (user['avatar'] = req.body.avatar);
		req.body.phone && (user['phone'] = req.body.phone);
		req.body.address && (user['address'] = req.body.address);
		userService.updateUserById(user, function(err, doc) {
			if (err) {
				next(err);
				return;
			}
			doc.password = void 0;
			res.json(doc);
		});
	});

module.exports = router;