var env = process.env.NODE_ENV || 'development';
var config = {
	development: require('./development.json'),
	test: require('./test.json'),
	product: require('./product.json')
};
module.exports = config[env];