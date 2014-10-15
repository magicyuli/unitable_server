var app = require('express')();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var expressErrorHandler = require('errorhandler');

var oauthserver = require('node-oauth2-server');


var models = require('./models');

var userRouter = require('./routers/userRouter.js');


app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8086);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

if (app.get('env') === 'development') {
	app.use(expressErrorHandler());
}


app.oauth = oauthserver({
	model: models.oAuthModel,
	grants: ['password', 'refresh_token'],
	debug: true
});

app.all('/oauth/token', app.oauth.grant());


app.all('/secret', app.oauth.authorise(), function(req, res) {
    res.send('Secret area');
});


app.use('/user', userRouter);


app.use(function(err, req, res, next) {
  if (process.env.NODE_ENV !== 'test')
    console.error('Error:', err);

  if (err && err.name === 'OAuth2Error') {
    res.status(401);
    res.send(err.errors);
  } else {
    res.status(err.code || 500);
    res.send('Error');
  }
});


module.exports = app;