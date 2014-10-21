var env = process.env.NODE_ENV || 'development';
var config = {
	development: require('./development'),
	test: require('./test'),
	product: require('./product')
};
module.exports = config[env];