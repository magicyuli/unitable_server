var config = require('./../config');
var mongoose = require('mongoose');

mongoose.connect(config.db, {});

module.exports.oAuthModel = require('./oauth_models.js');