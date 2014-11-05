var env = process.env.NODE_ENV || 'development';
var configs = {
	development: require('./development'),
	test: require('./test'),
	product: require('./product')
};
var config = configs[env];
module.exports = config;
//common configs
config['clientId'] = 'unitableself';
config['clientSecret'] = '9a5667gfn5h434df7dh8f99';
config['clientCredentials'] = new Buffer(config.clientId + ":" + config.clientSecret).toString('base64');
config['defaultEventListSize'] = 10;
config['regularLogPath'] = './logs/logs.log';
config['errorLogPath'] = './logs/errors.log';
