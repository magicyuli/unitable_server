var router = require('express').Router();
var debug = require('debug')('dev');

var PostService = require('../services/postService');

router.route('/member/post')
/**
 * When sending POST to /member/post, add a new post
 */
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
    if (err) { return next(err); }
    debug(post);
    res.send({ post: post });
  });

})
/**
 * When sending GET to /member/post, query posts according to parameters
 */
.get(function(req, res, next) {
  if (!req.user)   {
    return next(new Error('User is required for GET POSTS'));
  }

    var asHost = '1' === req.param('host');
    var asGuest = '1' === req.param('guest');
    var populate = '1' === req.param('populate');

    PostService.getPostsByUser({ user: req.user, asHost: asHost, asGuest: asGuest, populate: populate }, function(err, posts) {
      if (err) {
        return next(err);
      }
      res.json(posts);
    });

});

/**
 * Guesting starts
 * @author Lee
 */
router.route('/member/guest')
  .get(function(req, res, next) {
    res.status(405).end();
  })
  .post(function(req, res, next) {
    var userId = req.user.id;
    var postId = req.body.postId;
    PostService.guest(userId, postId, function(err, num, raw) {
      if (err) {
        next(err);
        return;
      }
      console.log("postRouter.js:68: user %s guesting %s successful", userId, postId);
      res.json({message: "guesting succeeded"});
    });
  });

module.exports = router;