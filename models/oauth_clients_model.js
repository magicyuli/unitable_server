var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OAuthClientsSchema = new Schema({
	clientId: {type: String},
	clientSecret: {type: String},
	redirectUri: {type: String},
	grantTypes: {type: [String], required: true}
});

mongoose.model('OAuthClients', OAuthClientsSchema);

var OAuthClientsModel = mongoose.model('OAuthClients');

module.exports = {
	getClient: function(clientId, clientSecret, callback) {
		var params = {clientId: clientId};
		if (clientSecret) params.clientSecret = clientSecret;
		OAuthClientsModel.findOne(params, callback);
	},
	saveClient: function(client, callback) {
		var client = new OAuthClientsModel(client);
		client.save(callback);
	},
	grantTypeAllowed: function(clientId, grantType, callback) {
		OAuthClientsModel.findOne({
			clientId: clientId,
			grantType: {$in: [grantType]}
		}, function(err, doc) {
			if (err) {
				console.warn("client: " + clientId + "grant type" + grantType + "not allowed");
				callback(err, false);
			} else {
				console.log("client: " + clientId + " grant type " + grantType + " allowed");
				callback(false, true);
			}
		});
	},
};