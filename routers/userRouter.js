var router = require('express').Router();
var request = require('request');

var config = require('../config');
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
			console.log("userRouter.js:26");
			console.log(err);
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
					doc.password = undefined;
					res.json({ user: doc, tokens: body });
				});
			});
	});

router.route('/member/profile')
	.get(function(req, res, next) {
		var userId;
		console.log("userRouter.js:63:GET /member/profile");
		if (req.query.id) {
			console.log("requesting profile of another user");
			userId = req.query.id;
		} else {
			console.log("requesting profile of self");
			userId = req.user.id;
		}
		if (!userId) {
			next(new Error("user id required"));
			return;
		}
		console.log("requesting profile of user id " + userId);
		userService.getProfileById(userId, function(err, doc) {
			if (err) {
				next(err);
				return;
			}
			res.json(doc);
		});
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
			res.json({
				_id: doc._id,
				name: doc.name,
				phone: doc.phone,
				address: doc.address,
				avatar: doc.avatar,
				email: doc.email,
				gender: doc.gender
			});
		});
	});

module.exports = router;