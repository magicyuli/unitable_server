var mongoose = require('mongoose');
var debug = require('debug')('dev');

var models = require('../models');
var DishModel = models.DishesModel;
var PostModel = models.PostsModel;
var UserModel = models.UsersModel;

exports.getDishByName = function(data, callback) {
  if (!data || !data.name || !data.user) {
    return callback(new Error('Name/User is required'));
  }
  DishModel.find({ hostId: data.user._id, name: data.name }, callback);
};

exports.newPosts = function(data, callback) {
  if (!data.events || !data.event instanceof Array) {
    return callback(new Error('Events are required as an array'));
  }

  var added = [];
  var skip = false;

  data.events.forEach(function(e) {
    if (skip) {
      return;
    }
    exports.newPost({ user: data.user, event: e, dishes: e.dishes, populate: data.populate }, function(err, newpost) {
      if (err) {
        skip = true;
        return callback(err);
      }
      added.push(newpost);
      if (added.length >= data.events.length) {
        callback(null, added);
      }
    });
  });
};

exports.newPost = function(data, callback) {
  if (!data || !data.user) {
    return callback(new Error('User is required'));
  }
  if (!data.event) {
    return callback(new Error("Event is required"));
  }

  var newpost = new PostModel({
    date: data.event.date,
    location: data.event.location,
    host: data.user._id,
    dishes: [],
    maxGuestNum: data.event.maxGuestNum
  });

  var stop = false;

  if (data.dishes && data.dishes instanceof Array && data.dishes.length > 0) {
    debug('querying existing dishes');
    var userDishes = [];
    data.dishes.forEach(function(d, i) {
      if (stop) { return; }
      DishModel.findOneAndUpdate(
        { host: data.user._id, name: d.name },
        { $set: { description: d.description, name: d.name, host: data.user._id } },
        { upsert: true },
        function(err, doc) {
          if (err) {
            stop = true;
            return callback(err);
          }
          newpost.dishes.push(doc._id);
          userDishes.push(doc._id);
          if (newpost.dishes.length == data.dishes.length) {
            debug('saving new post');
            newpost.save(function(err, p) {
              if (err) {
                return callback(err);
              }
              UserModel.findByIdAndUpdate(data.user._id, { $addToSet: { dishes: { $each: userDishes } } }, function(err, u) {
                if (err) { return callback(err); }
                if (data.populate) {
                  PostModel.findById(p._id).populate({ path: 'dishes' }).populate({ path: 'guests' }).exec(function(err, populatedPost) {
                    if (err) {
                      return callback(err);
                    }
                    populatedPost.host = u;
                    callback(null, p, u);
                  })
                } else {
                  callback(null, p, u);
                }
              });
            });
          }
        }
      );
    });
  } else {
    debug('saving new post');
    newpost.save(function(err, np) {
      if (err) {
        return callback(err);
      }
      callback(null, np, data.user);
    });
  }
};

exports.getPostsByUser = function(data, callback) {
  if (!(data && data.user)) {
    return callback(new Error('User is required'));
  }

  var asHost = data.asHost || false;
  var asGuest = data.asGuest || false;
  var populate = data.populate || false;

  // if none options specified, fetch host posts by default
  if (!(asHost || asGuest)) {
    asHost = true;
  }

  var userPosts = [];

  function populatePost(query) {
    return query.populate({ path: 'dishes' }).populate({ path: 'guests' }).populate({ path: 'host' });
  }

  function findHostPosts(next) {
    var query = PostModel.find({ host: data.user._id });
    if (populate) {
      populatePost(query);
    }
    query.exec(function(err, result) {
      if (err) {
        return callback(err);
      }
      userPosts = userPosts.concat(result);
      if (next && typeof next === 'function') {
        next();
      } else {
        callback(null, userPosts);
      }
    });
  }

  function findGuestPosts(next) {
    //if (data.user.guestEvents.length <= 0) {
    //  if (next && typeof next === 'function') {
    //    return next();
    //  }
    //  return callback(null, userPosts);
    //}
    var query = PostModel.find({ guests : { $in: [data.user._id] } });
    if (populate) {
      populatePost(query);
    }
    query.exec( function(err, result) {
      if (err) {
        return callback(err);
      }
      userPosts = userPosts.concat(result);
      if (next && typeof next === 'function') {
        next();
      } else {
        callback(null, userPosts);
      }
    });
  }

  if (asHost) {
    var next = null;
    if (asGuest) {
      next = findGuestPosts;
    }
    findHostPosts(next);
  } else {
    findGuestPosts();
  }
};
/**
 *@author Lee
 */
exports.guest = function (userId, postId, callback) {
  PostModel.update({ _id: postId, host: { $ne: userId } }, { $push: { guests: userId }}, callback);
};