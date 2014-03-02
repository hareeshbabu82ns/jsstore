'use strict';

// User routes use users controller
var users = require('../controllers/users');
var authorization = require('./middlewares/authorization');

module.exports = function (app, passport) {
  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/signout', users.signout);
  app.get('/users/me', users.me);

  app.post('/user/:userId/update', authorization.requiresLogin, users.update);
  app.get('/user/:userId/genotp', authorization.requiresLogin, users.genOTP);
  app.get('/user/:userId/delotp', authorization.requiresLogin, users.delOTP);

  // Setting up the users api
  app.post('/users', users.create);

  // Setting up the userId param
  app.param('userId', users.user);

  // Setting the local strategy route
  app.post('/users/session', passport.authenticate('localOTP', {
    failureRedirect: '/signin',
    failureFlash: true
  }), users.session);

};
