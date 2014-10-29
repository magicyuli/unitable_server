var router = require('express').Router();
var debug = require('debug')('dev');

router.route(/.*/).all(function(req, res, next) {
  res.set({
    'Access-Control-Allow-Origin': req.headers.origin,
    'Access-Control-Allow-Credentials': 'true'
  });
  if ('access-control-request-headers' in req.headers) {
    res.set({
      'Access-Control-Allow-Headers': req.headers['access-control-request-headers']
    });
  }
  if (req.method.toLowerCase() == 'options') {
    debug(req.method);
    res.sendStatus(200);
  } else {
    next();
  }
});

module.exports = router;
