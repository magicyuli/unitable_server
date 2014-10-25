var router = require('express').Router();
var userService = require('../services/userService')

router.route('/register')

.get(function(req, res, next) {
	res.status(405).end();
})
.post(function(req, res, next) {
	var user = {};

	user['email'] = req.param('email');
	user['name'] = req.param('name');
	user['pwd'] = req.param('password');
	user['gender'] = req.param('gender');
	user['avatar'] = req.param('avatar') || null;
	user['phone'] = req.param('phone') || null;
	user['address'] = req.param('address') || null;

	try {
		userService.checkValid(user);
	} catch (err) {
		res.status(400).send(err.message);
		return;
	}
	
	userService.saveUser(user,
		function(doc) {
			//TODO
			res.set('content-type', 'text/plain');
			res.send(JSON.stringify(doc, null, "    "));
			//res.json(doc);
		},
		function(err) {
			res.status(500).send(err);
		});
});

module.exports = router;