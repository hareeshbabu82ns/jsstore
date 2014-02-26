'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    UserCtrl = require('./users');

exports.render = function (req, res) {

  User.count(function (err, count) {
    if (err || count == 0) {
      res.render('users/signup', {
        title: 'Signup',
        user: new User()
      });
    } else {
      if (req.isAuthenticated()) {
        res.render('index', {
          user: req.user ? JSON.stringify(req.user) : 'null'
        });
      } else {
        res.render('users/signin', {
          title: 'Signin'
        });
      }
    }
  });
};
