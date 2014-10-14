var OAuthAccessTokensModel = require('./oauth_access_tokens_model.js');
var OAuthRefreshTokensModel = require('./oauth_refresh_tokens_model.js');
var OAuthClientsModel = require('./oauth_clients_model.js');
var UsersModel = require('./users_model.js');

module.exports = {
	//must have
	getAccessToken:         OAuthAccessTokensModel.getAccessToken,
	saveAccessToken:        OAuthAccessTokensModel.saveAccessToken,
	getClient:              OAuthClientsModel.getClient,
	grantTypeAllowed:       OAuthClientsModel.grantTypeAllowed,

	//for refresh token grant type
	getRefreshToken:        OAuthRefreshTokensModel.getRefreshToken,
	saveRefreshToken:       OAuthRefreshTokensModel.saveRefreshToken,
	
	//for password grant type
	getUser:                UsersModel.getUser
};