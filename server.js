#!/usr/bin/env node
var http = require('http');

var app = require('./app');
var logger = require('./utils/logger');
//var https = require('https');

http.createServer(app).listen(app.get('port'), function() {
	logger.info("http server listening on :8086");
});
//https.createServer(app).listen(443);