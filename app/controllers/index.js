'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    UserCtrl = require('./users');

exports.render = function (req, res) {

  var userExist = true;
  User.count(function (err, count) {
    if (err || count == 0) {
      res.render('users/signup', {
        title: 'Signup',
        user: new User()
      });
    } else {
      res.render('index', {
        user: req.user ? JSON.stringify(req.user) : 'null'
      });
    }
  });
};
