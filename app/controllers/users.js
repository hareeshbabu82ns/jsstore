'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User');

/**
 * Auth callback
 */
exports.authCallback = function (req, res) {
  res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function (req, res) {
  res.render('users/signin', {
    title: 'Signin',
    message: req.flash('error')
  });
};

/**
 * Show sign up form
 */
exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};

/**
 * Logout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function (req, res) {
  res.redirect('/');
};

exports.update = function (req, res) {

  var user = req.profile;
  //console.log(JSON.stringify(req.body));
  delete req.body._id;

  if (req.body.pwd && req.body.pwd.length) {
    user.password = req.body.pwd;
    req.body.hashed_password = user.hashed_password;
  }

  user.update(req.body, function (err) {
    if (err) {
      res.jsonp({err: err, msgs: [
        {text: 'not updated', type: 'error'}
      ]});
    } else {
      res.jsonp({msgs: [
        {text: 'info updated', type: 'success'}
      ]});
    }
  });

//  var user = req.body;
//  var id = user._id;
//  if (user._id) {
//    delete user._id;
//  }
//  User.update({_id: id}, user, function (err) {
//    if (err) {
//      res.jsonp({err: err});
//    } else {
//      res.jsonp({msg: 'info updated'});
//    }
//  });
};

exports.updPwd = function (req, res) {
  var pwd = req.body;
};

/**
 * Create user
 */
exports.create = function (req, res, next) {
  var user = new User(req.body);
  var message = null;

  user.provider = 'local';
  user.save(function (err) {
    if (err) {
      switch (err.code) {
        case 11000:
        case 11001:
          message = 'Username already exists';
          break;
        default:
          message = 'Please fill all the required fields';
      }

      return res.render('users/signup', {
        message: message,
        user: user
      });
    }
    req.logIn(user, function (err) {
      if (err) return next(err);
      return res.redirect('/');
    });
  });
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function (req, res, next, id) {
  User
      .findOne({
        _id: id
      })
      .exec(function (err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.profile = user;
        next();
      });
};