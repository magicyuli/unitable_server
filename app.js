var app = require('express')();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var expressErrorHandler = require('errorhandler');

var routers = require('./routers');

app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8086);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
if (app.get('env') === 'development') {
    //seems this doesn't work?
    app.use(expressErrorHandler());
}

app.use(routers.timelineRouter);
app.use(routers.userRouter);
//oauth related
app.use(routers.oauthRouter);
app.use(routers.postRouter);
app.use(routers.myEventRouter);


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