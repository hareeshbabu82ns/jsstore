'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Otp = mongoose.model('Otp'),
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
      ], user: user});
    }
  });
};

/**
 * Create user
 */
exports.create = function (req, res, next) {
  var user = new User(req.body);
  var message = null;
  User.count(function (err, count) {
    if (count != 0) {
      return res.render('users/signup', {
        message: 'Admin User Already Exist please go to Login',
        user: user
      });
    } else {
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
    }
  });
};
/**
 * Remove OTP for User
 */
exports.delOTP = function (req, res) {
  var user = req.profile;
  var otp_id = user.otp;
  User.update({_id: user._id}, {otp: null}, function (err, num, rUser) {
    if (!err) {
      user.otp = null;
      user.salt = '';
      user.hashed_password = '';
      console.log(user);
      Otp.remove({_id: otp_id}, function (err) {
        if (!err) {
          res.jsonp({user: user, msgs: [
            {text: 'OTP removed', type: 'success'}
          ]});
        } else {
          res.jsonp({msgs: [
            {text: 'User profile updated', type: 'success'},
            {text: 'OTP could not be deleted', type: 'error'}
          ]});
        }
      });
    }
  });
};
/**
 * Generate OTP for User
 **/
exports.genOTP = function (req, res) {
  var user = req.profile;
  if (user.otp) {
    res.jsonp({msgs: [
      {text: 'User already have OTP', type: 'error'}
    ]});
  } else {
    var otp = new Otp();
    otp.title = user.name;
    otp.email = user.email;
    otp.save(function (err) {
      if (err) {
        res.jsonp({msgs: [
          {text: 'OTP generation failed', type: 'error'}
        ]});
      } else {
        user.update({otp: otp}, function (err) {
          if (err) {
            otp.remove(function (err) {
              res.jsonp({msgs: [
                {text: 'Error linking OTP to User', type: 'error'}
              ], user: user});
            });
          } else {
            user.otp = otp;
            user.hashed_password = '';
            user.salt = '';
            res.jsonp({msgs: [
              {text: 'OTP Generated', type: 'success'}
            ], user: user});
          }
        });
      }
    });
  }
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