var app = require('express')();
var http = require('http');
//var https = require('https');
var bodyParser = require('body-parser');

var userRouter = require('./routers/userRouter.js');

function start () {
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use('/user', userRouter);

	http.createServer(app).listen(8086, function() {
		console.log("http server listening on :8086");
	});
	//https.createServer(app).listen(443);
}

exports.start = start;
