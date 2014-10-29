var router = require('express').Router();
var debug = require('debug')('dev');

var PostService = require('../services/postService');

router.route('/member/post')
.post(function(req, res, next) {
    debug(req.body);

    if (!req.user) {
      return next(new Error('User is required for NEW POST'));
    }

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