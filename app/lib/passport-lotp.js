/**
 * Passport Local OTP Strategy
 * with UserName, Password/OTP key
 */

/**
 * Module dependencies.
 */
var passport = require('passport')
    , util = require('util');


/**
 * `Strategy` constructor.
 *
 * The local authentication strategy authenticates requests based on the
 * credentials submitted through an HTML-based login form.
 *
 * Applications must supply a `verify` callback which accepts `username` and
 * `password` credentials, and then calls the `done` callback supplying a
 * `user`, which should be set to `false` if the credentials are not valid.
 * If an exception occured, `err` should be set.
 *
 * Optionally, `options` can be used to change the fields in which the
 * credentials are found.
 *
 * Options:
 *   - `usernameField`  field name where the username is found, defaults to _username_
 *   - `passwordField`  field name where the password is found, defaults to _password_
 *   - `otpField`  field name where the otp is found, defaults to _otp_
 *   - `passReqToCallback`  when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Examples:
 *
 *     passport.use(new LocalStrategy(
 *       function(username, password, otp, done) {
 *         User.findOne({ username: username, password: password }, function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('localOTP authentication strategy requires a verify function');

  this._usernameField = options.usernameField || 'username';
  this._passwordField = options.passwordField || 'password';
  this._otpField = options.otpField || 'otp';

  passport.Strategy.call(this);
  this.name = 'localOTP';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function (req, options) {
  options = options || {};
  var username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
  var password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);
  var otp = lookup(req.body, this._otpField) || lookup(req.query, this._otpField);

  if (!username || (!password && !otp)) {
    return this.fail(new BadRequestError(options.badRequestMessage || 'Missing credentials'));
  }

  var self = this;

  function verified(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      return self.fail(info);
    }
    self.success(user, info);
  }

  if (self._passReqToCallback) {
    this._verify(req, username, password, otp, verified);
  } else {
    this._verify(username, password, otp, verified);
  }

  function lookup(obj, field) {
    if (!obj) {
      return null;
    }
    var chain = field.split(']').join('').split('[');
    for (var i = 0, len = chain.length; i < len; i++) {
      var prop = obj[chain[i]];
      if (typeof(prop) === 'undefined') {
        return null;
      }
      if (typeof(prop) !== 'object') {
        return prop;
      }
      obj = prop;
    }
    return null;
  }
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;

/**
 * `BadRequestError` error.
 *
 * @api public
 */
function BadRequestError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'BadRequestError';
  this.message = message || null;
};

/**
 * Inherit from `Error`.
 */
BadRequestError.prototype.__proto__ = Error.prototype;