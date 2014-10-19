/* Connect to Mongodb */
var mongoose = require('mongoose');
var config = require('../config');
mongoose.connect(config.db, {});

/* Load all defined models */
var loadModels = ['oauth', 'unitable'];
loadModels.forEach(function(m) {require('./' + m);});