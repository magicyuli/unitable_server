var mongoose = require('mongoose');
var models = require('./../models');
var UsersModel = require('./../models/users_model.js');
var OAuthClientsModel = require('./../models/oauth_clients_model.js');

var fixtures = {
  clients: [{
    clientId: 'unitableself',
    clientSecret: '9a5667gfn5h434df7dh8f99',
    redirectUri: '/oauth/redirect',
    grantTypes: ['password', 'refresh_token']
  }],

  users: [{
    email: 'test@unitable.com',
    hashedPassword: 'testpassword'
  }]
};

// function insertData(model, fixture, cb) {
//   var o = new model(fixture);
//   o.save(cb);
// }

var connection = mongoose.connection;

before(function(cb) {
  connection.on('open', function() {
    connection.db.dropDatabase(function() {
      UsersModel.saveUser(fixtures.users[0], function() {
        OAuthClientsModel.saveClient(fixtures.clients[0], cb);
      });
    });
  });
});