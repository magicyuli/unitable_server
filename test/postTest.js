var request = require('supertest');
var assert = require('assert');
var debug = require('debug');
var app = require('../app');
var connection = require('mongoose').connection;

var config = require('../config');
var PostService = require('../services/postService');
var userService = require('../services/userService');
var oAuthService = require('../services/oauthService');
var models = require('../models');
var DishModel = models.DishesModel;
var UserModel = models.UsersModel;

var fixtures = {
  clients: [
    {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: '/oauth/redirect',
      grantTypes: ['password', 'refresh_token']
    }
  ],

  users: [
    {
      email: 'test@unitable.com',
      password: 'testpassword',
      name: "Lee",
      gender: 1
    },
    {
      email: 'tiden111@gmail.com',
      password: '000000',
      name: "Daryl",
      gender: 1
    }
  ]
};

var tidenUser = null;
var testUser = null;

describe('Post Service Tests', function() {

  before(function(cb) {
    if (connection.readyState !== 1) {
        connection.on('open', onReady);
      } else {
        onReady();
      }

      function onReady () {
        connection.db.dropDatabase(function() {
          fixtures.users.forEach(function(u, i) {
            userService.saveUser(u, function(err, doc) {
              if (doc.email == 'test@unitable.com') {
                testUser = doc;
              } else {
                tidenUser = doc;
              }
              if (i >= fixtures.users.length - 1) {
                fixtures.clients.forEach(function(c, j) {
                  oAuthService.saveClient(c, function(err, doc) {
                    if (j >= fixtures.clients.length - 1) {
                      cb();
                    }
                  });
                });
              }
            });
          });
        });
      };
  });

  it('should add a post as well as the new dishes to the db', function(done) {
    //UserModel.findOne({ email: 'test@unitable.com' }, function(err, user) {
      var user = testUser;

      var post = {
        date: new Date(),
        location: 'Torrens Building Class Room 1',
        host: user._id,
        maxGuestNum: 10
      };

      var dishes = [
        { name: 'Cake', description: 'a fucking cake', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
        { name: 'Orange Juice', description: 'yummy', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
        { name: 'Shit', description: 'it stinks', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
        { name: 'jQuery', description: '$', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] }
      ];

      PostService.newPost({ user: user, event: post, dishes: dishes }, function(err, doc) {
        assert(doc, "new post isn't saved");
        done(err);
      });

    //});
  });

  it("should add a post and update the user's existing dishes", function(done) {
    UserModel.findOne({ email: 'tiden111@gmail.com' }, function(err, user) {

      var dishes = [
        { name: 'dish1', description: 'some dish', host: user._id, pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
        { name: 'dish2', description: 'some dish', host: user._id, pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
        { name: 'dish3', description: 'some dish', host: user._id, pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
        { name: 'dish4', description: 'some dish', host: user._id, pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] }
      ];

      dishes.forEach(function(d, i) {
        new DishModel(d).save(function(err, dish) {

          user.dishes.push(dish._id);

          if(i >= dishes.length - 1) {

            user.save(function(err, user) {

              var post = { date: new Date(), location: '#701 Tower Apartments SA 5000', host: user._id, maxGuestNum: 10 };

              var dishesToUpdate = [{ name: 'dish1', description: 'updated dish', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO']}];

              DishModel.find({ host: user._id }, function(err, userdishes) {

                PostService.newPost({ user: user, event: post, dishes: dishesToUpdate }, function(err, newpost) {

                  DishModel.find({ host: user._id, name: 'dish1' }, function(err, updatedDish) {
                    assert(updatedDish.length > 0, 'did not find dish1');
                    assert.equal(updatedDish[0].description, 'updated dish', 'did not successfully updated');

                    DishModel.find({ host: user._id }, function(err, alldishes) {
                      assert.equal(alldishes.length, userdishes.length, 'inserted extra dishes');
                      UserModel.findOne({ email: 'tiden111@gmail.com' }, function(err, updatedUser) {
                        assert.equal(alldishes.length, updatedUser.dishes.length, "did not update user dishes ref");
                        done();
                      });
                    });

                  });

                });

              });

            });


          }

        });

      });

    });
  });

  it('should return posts for a host', function(done) {
    var user = tidenUser;
    var posts = [
      { date: new Date(), location: 'CR 1 Torrens Building Victoria Square SA 5000', host: user._id, maxGuestNum: 12 },
      { date: new Date(), location: 'Dining Room Torrens Building Victoria Square SA 5000', host: user._id, maxGuestNum: 10 },
      { date: new Date(), location: 'Project Room 3 Torrens Building Victoria Square SA 5000', host: user._id, maxGuestNum: 8 }
    ];

    var adish = { name: 'postDISH', description: 'a special dish for testing!', host: user._id, pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] };

    posts.forEach(function(p, i) {
      PostService.newPost({ user: user, event: p, dishes: [adish] }, function(err, newpost) {
        posts[i] = newpost;
        if (i == posts.length - 1) {
          PostService.getPostsByUser({ user: user }, function (err, userPosts) {
            assert(userPosts.length >= 3);
            done();
          });
        }
      });
    });

  });

  it('should return posts for a guest', function(done) {
    var user = testUser;

    var posts = [
      { date: new Date(), location: 'CR 1 Torrens Building Victoria Square SA 5000', host: user._id, maxGuestNum: 12},
      { date: new Date(), location: 'Dining Room Torrens Building Victoria Square SA 5000', host: user._id, maxGuestNum: 10 },
      { date: new Date(), location: 'Project Room 3 Torrens Building Victoria Square SA 5000', host: user._id, maxGuestNum: 8 },
      { date: new Date(), location: '00', host: user._id, maxGuestNum: 8 },
      { date: new Date(), location: '000', host: user._id, maxGuestNum: 8 },
      { date: new Date(), location: '0000', host: user._id, maxGuestNum: 8 },
      { date: new Date(), location: '00000', host: user._id, maxGuestNum: 8 },
      { date: new Date(), location: '000000', host: user._id, maxGuestNum: 8 },
      { date: new Date(), location: '0000000', host: user._id, maxGuestNum: 8 }
    ];

    var adish = { name: 'postDISH', description: 'a special dish for testing!', host: user._id, pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] };

    var guestEvents = [];

    var stop = false;
    posts.forEach(function(p, i) {
      if (stop) {
        return;
      }
      PostService.newPost({ user: user, event: p, dishes: [adish] }, function(err, _newpost, u) {
        if (err) {
          stop = true;
          return done(err);
        }
        _newpost.guests.push(tidenUser._id);
        _newpost.save(function(err, newpost) {
          if (err) {
            stop = true;
            return done(err);
          }
          user = u;
          posts[i] = newpost;
          guestEvents.push(newpost._id);
          if (guestEvents.length == posts.length) {
            //UserModel.findByIdAndUpdate(tidenUser._id, { $addToSet: { guestEvents: { $each: guestEvents } } }, function(err, _tuser) {
            //  if (err) { return done(err); }
            PostService.getPostsByUser({user: tidenUser, asGuest: true, populate: true}, function (err, userPosts) {
              assert(userPosts.length >= posts.length);
              var found = false;
              userPosts.forEach(function (uP) {
                if (uP.location == '000') {
                  found = true;
                }
              });
              assert(found);
              done();
            });
            //});
          }
        })
      });
    });

  });
});


describe('Post Events Tests', function(act) {
  var accessToken;
  var clientId = config.clientId;
  var clientSecret = config.clientSecret;
  var clientCredentials = config.clientCredentials;

  before(function(done) {

    request(app)
    .post('/oauth/token')
    .type('form')
    .set('Authorization', 'Basic ' + clientCredentials)
    .send({
      grant_type: 'password',
      username: 'tiden111@gmail.com',
      password: '000000'
    })
    .expect(200)
    .end(function(err, res) {
      assert(res.body.access_token, "access_token wasn't set");
      assert(res.body.refresh_token, "refresh_token wasn't set");
      accessToken = res.body.access_token;
      refreshToken = res.body.refresh_token;
      done();
    });

  });

  it('should send back the new post object', function(done) {

    request(app)
    .post('/member/post')
    .type('form')
    .set('Authorization', 'Bearer ' + accessToken)
    .send(
      {
        event: { date: new Date(), location: '2 Heaslip CL SA 5000', maxGuestNum: 10},
        dishes: [
          { name: 'dish5', description: 'some dish', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
          { name: 'dish6', description: 'some dish', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
          { name: 'dish7', description: 'some dish', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] },
          { name: 'dish8', description: 'some dish', pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] }
        ]
      }
    )
    .expect(200)
    .end(function(err, res) {
      assert(res.body.post, "server didn't return the post object");
      done();
    });

  });

  it('should send back all the host posts of the user', function(done) {
    var adish = { name: 'postDISH', description: 'a special dish for testing!', host: tidenUser._id, pictures: ['4WsquNEjFEjFL9O+9YgOL9O+EjFL9O+9YgO9YgOQbqbAEjFL9O+9YgO'] };
    var newposts = [
      { date: new Date(), location: '1111111CR 1 Torrens Building Victoria Square SA 5000', host: tidenUser._id, maxGuestNum: 12, dishes: [adish] },
      { date: new Date(), location: '1111111Dining Room Torrens Building Victoria Square SA 5000', host: tidenUser._id, maxGuestNum: 10, dishes: [adish] },
      { date: new Date(), location: '1111111DProject Room 3 Torrens Building Victoria Square SA 5000', host: tidenUser._id, maxGuestNum: 8, dishes: [adish] },
      { date: new Date(), location: '1111111D00', host: tidenUser._id, maxGuestNum: 8, dishes: [adish] },
      { date: new Date(), location: '0001111111D', host: tidenUser._id, maxGuestNum: 8, dishes: [adish] },
      { date: new Date(), location: '00001111111D', host: tidenUser._id, maxGuestNum: 8, dishes: [adish] },
      { date: new Date(), location: '000001111111D', host: tidenUser._id, maxGuestNum: 8, dishes: [adish] },
      { date: new Date(), location: '0000001111111D', host: tidenUser._id, maxGuestNum: 8, dishes: [adish] },
      { date: new Date(), location: '00000001111111D', host: tidenUser._id, maxGuestNum: 8, dishes: [adish] }
    ];
    PostService.newPosts({ user: tidenUser, events: newposts }, function(err, newevents) {
      if (err) {
        return done(err);
      }
      request(app)
        .get('/member/post?host=1&populate=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .end(function(err, res) {
          assert(res.body, "server didn't return the posts object");
          assert(res.body.length >= newevents.length, "server didn't return sufficient posts");
          done();
        });
    });
  });
});