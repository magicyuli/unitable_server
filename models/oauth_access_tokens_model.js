var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OAuthAccessTokensSchema = new Schema({
	accessToken: {type: String, required: true, unique: true},
	clientId: {type: String},
	userId: {type: String, required: true},
	expires: {type: Date}
});

mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema);

var OAuthAccessTokensModel = mongoose.model('OAuthAccessTokens');

module.exports = {
	getAccessToken: function(bearerToken, callback) {
		console.log("get access token: " + bearerToken);
		
		OAuthAccessTokensModel.findOne({accessToken: bearerToken}, callback);
	},
	saveAccessToken: function(accessToken, clientId, expires, userId, callback) {
		console.log("saving" + "(accessToken: " + accessToken + ", clientId: " + clientId + ", userId: " + userId + ", expires: " + expires + ")");
		
		var oAuthAccessToken = new OAuthAccessTokensModel({
			accessToken: accessToken,
			clientId: clientId,
			userId: userId,
			expires: expires
		});

		oAuthAccessToken.save(callback);
	}
};