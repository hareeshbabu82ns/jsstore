'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    SecTree = mongoose.model('SecTree');

/**
 * Find article by id
 */
exports.nextID = function (req, res) {
  SecTree.nextCount(function (err, count) {
    if (err) return res.jsonp({err: err});
    res.jsonp({count: count});
  });
};
