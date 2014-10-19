var mongoose = require('mongoose');
var models = require('../models');
var userService = require('../services/userService');
var oAuthService = require('../services/oAuthService');

var fixtures = {
  clients: [{
    clientId: 'unitableself',
    clientSecret: '9a5667gfn5h434df7dh8f99',
    redirectUri: '/oauth/redirect',
    grantTypes: ['password', 'refresh_token']
  }],

  users: [{
    email: 'test@unitable.com',
    // MD5 hashed password 'testpassword'
    hashedPassword: '4WsquNEjFL9O+9YgOQbqbA=='
  }]
};

var connection = mongoose.connection;

before(function(cb) {
  connection.on('open', function() {
    connection.db.dropDatabase(function() {
      userService.saveUser(fixtures.users[0], function() {
        oAuthService.saveClient(fixtures.clients[0], cb);
      });
    });
  });
});