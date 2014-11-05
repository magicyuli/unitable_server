var app = require('express')();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var logger = require('./utils/logger');

var routers = require('./routers');

app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8086);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev', { "stream": logger.stream }));

app.use(routers.optionsRouter);
app.use(routers.timelineRouter);
//oauth related
app.use(routers.oauthRouter);
app.use(routers.userRouter);
app.use(routers.postRouter);
app.use(routers.myEventRouter);


app.use(function(err, req, res, next) {
    logger.error(err);

    if (err && err.name === 'OAuth2Error') {
        res.status(err.code).send(err.errors);
    } else {
        res.status(err.code || 500).send(err.message);
    }
});


module.exports = app;