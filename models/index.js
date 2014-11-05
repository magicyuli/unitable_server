/* Connect to Mongodb */
var mongoose = require('mongoose');
var config = require('../config');
var logger = require('../utils/logger');

logger.info('Connecting to db: ' + config.db);
mongoose.connect(config.db, {});

var oauthModels = require('./oauthModels');
var unitableModels = require('./unitableModels');

module.exports = {
	OAuthAccessTokensModel: oauthModels.OAuthAccessTokensModel,
	OAuthRefreshTokensModel: oauthModels.OAuthRefreshTokensModel,
	OAuthClientsModel: oauthModels.OAuthClientsModel,
	
	UsersModel: unitableModels.UsersModel,
	PostsModel: unitableModels.PostsModel,
	DishesModel: unitableModels.DishesModel
};