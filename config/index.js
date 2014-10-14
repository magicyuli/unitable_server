var env = process.env.NODE_ENV || 'development';
var config = {
	development: require('./development.json'),
	test: require('./test.json'),
	release: require('./release.json')
};
module.exports = config[env];