var env = process.env.NODE_ENV || 'development';
var configs = {
	development: require('./development'),
	test: require('./test'),
	product: require('./product')
};
var config = configs[env];
module.exports = config;
//common configs
config['defaultEventListSize'] = 10;
