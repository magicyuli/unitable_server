var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OAuthRefreshTokensSchema = new Schema({
	refreshToken: {type: String, required: true, unique: true},
	clientId: {type: String},
	userId: {type: String, required: true},
	expires: {type: Date}
});

mongoose.model('OAuthRefreshTokens', OAuthRefreshTokensSchema);

var OAuthRefreshTokensModel = mongoose.model('OAuthRefreshTokens');

module.exports = {
	getRefreshToken: function(refreshToken, callback) {
		console.log("get refresh token: " + refreshToken);
		
		OAuthRefreshTokensModel.findOne({refreshToken: refreshToken}, callback);
	},
	saveRefreshToken: function(refreshToken, clientId, expires, userId, callback) {
		console.log("saving" + "(refreshToken: " + refreshToken + ", clientId: " + clientId + ", userId: " + userId + ", expires: " + expires + ")");
		var oAuthRefreshToken = new OAuthRefreshTokensModel({
			refreshToken: refreshToken,
			clientId: clientId,
			userId: userId,
			expires: expires
		});
		oAuthRefreshToken.save(callback);
	}
};