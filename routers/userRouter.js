var router = require('express').Router();
var userService = require('../services/userService')

router.route('/user/add')

.all(function(req, res, next) {
	//TODO
	console.log("/add's all middleware");
	next();
})

.get(function(req, res, next) {
	var options = {
		root: __dirname
	}
	res.sendFile('test.html', options);
})

.post(function(req, res, next) {
	var data = {};

	data['name'] = req.param('username');
	data['pwd'] = req.param('password');
	data['gender'] = req.param('gender');
	data['phone'] = req.param('phone');
	data['email'] = req.param('email');
	
	userService.addUser(data,
	function(doc) {
		//TODO
		res.set('content-type', 'text/plain');
		res.send(JSON.stringify(doc, null, "    "));
		//res.json(doc);
		res.end();
	},
	function(err) {
		res.status(500).send(err);
		res.end();
	});
});

module.exports = router;