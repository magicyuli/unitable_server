var app = require('express')();
var bodyParser = require('body-parser');
var oauthserver = require('node-oauth2-server');
var models = require('./models');

var userRouter = require('./routers/userRouter.js');


app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8086);

app.use(bodyParser.urlencoded({ extended: false }));

app.oauth = oauthserver({
	model: models.oAuthModel,
	grants: ['password', 'refresh_token'],
	debug: true
});

app.all('/oauth/token', app.oauth.grant());


app.use('/user', userRouter);

module.exports = app;