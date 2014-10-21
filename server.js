#!/usr/bin/env node
var http = require('http');

var app = require('./app');
//var https = require('https');

http.createServer(app).listen(app.get('port'), function() {
	console.log("http server listening on :8086");
});
//https.createServer(app).listen(443);

