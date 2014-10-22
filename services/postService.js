var mongoose = require('mongoose');
var debug = require('debug')('dev');

var models = require('../models');
var DishModel = models.DishesModel;
var PostModel = models.PostsModel;

exports.getDishByName = function(data, callback) {
  if (!data || !data.name || !data.user) {
    callback(new Error('Name/User is required'));
    return;
  }
  DishModel.find({ hostId: data.user._id, name: data.name }, callback);
};

exports.newPost = function(data, callback) {
  if (!data || !data.user) {
    callback(new Error('User is required'));
    return;
  }
  if (!data.event) {
    callback(new Error("Event is required"));
    return;
  }
  var newpost = new PostModel({
    date: data.event.date,
    location: data.event.location,
    host: data.user._id,
    dishes: [],
    maxGuestNum: data.event.maxGuestNum
  });

  if (data.dishes) {
    debug('querying existing dishes');
    data.dishes.forEach(function(d) {
      DishModel.findOneAndUpdate(
        { host: data.user._id, name: d.name },
        { $set: { description: d.description, name: d.name, host: data.user._id } },
        { upsert: true },
        function(err, doc) {
          if(err) { /* TODO Error handling */ }
          newpost.dishes.push(doc._id);
          if(newpost.dishes.length == data.dishes.length) {
            debug('saving new post');
            newpost.save(callback);
          }
        }
      );
    });
  } else {
    debug('saving new post');
    newpost.save(callback);
  }
};