/* OAuth schemas */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemas = {
    'OAuthAccessTokens': {
        accessToken: { type: String, required: true, unique: true },
        clientId: { type: String },
        userId: { type: String, required: true },
        expires: { type: Date }
    },
    'OAuthClients': {
        clientId: { type: String },
        clientSecret: { type: String },
        redirectUri: { type: String },
        grantTypes: { type: [String], required: true }
    },
    'OAuthRefreshTokens': {
        refreshToken: { type: String, required: true, unique: true },
        clientId: { type: String },
        userId: { type: String, required: true },
        expires: { type: Date }
    }
};

for(var sName in schemas) {
    var schema = new Schema(schemas[sName]);
    mongoose.model(sName, schema);
    exports[sName + 'Model'] = mongoose.model(sName);
}