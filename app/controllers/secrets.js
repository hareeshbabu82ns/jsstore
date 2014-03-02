'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Otp = mongoose.model('Secret'),
    _ = require('lodash');

/**
 * Find article by id
 */
exports.secret = function (req, res, next, id) {
  Secret.load(id, function (err, secret) {
    if (err) return next(err);
    if (!secret) return next(new Error('Failed to load secret ' + id));
    req.secret = secret;
    next();
  });
};
