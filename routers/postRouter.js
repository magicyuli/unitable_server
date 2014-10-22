var router = require('express').Router();
var debug = require('debug')('dev');

var UserService = require('../services/userService');
var PostService = require('../services/postService');

router.route('/oauth/post')

.all(function(req, res, next) {
    debug('dealing with verified user');
    debug(req.user);
    console.log(req.user);
    if (req.user && req.user.id) {
        var _oldUser = req.user;
        UserService.getUserById({ id: _oldUser.id }, function(err, user) {
            debug(err);
            debug(user);
            if (err) { /* TODO handle error */ }
            else {
                req.user = user;
                next();
            }
        });
    }
})

.post(function(req, res, next) {
    debug(req.body);

    var data = {
        user: req.user,
        event: req.body.event,
        dishes: req.body.dishes
    };

    debug(data);
    PostService.newPost(data, function(err, post) {
        debug(post);
        res.send({ post: post });
    });

})

;

module.exports = router;