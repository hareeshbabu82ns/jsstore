'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Secrets Tree Schema
 */
var SecTreeSchema = new Schema({
  id: Number,
  text: {
    type: String,
    trim: true
  },
  parent: Number
});

/**
 * Validations
 */
SecTreeSchema.path('text').validate(function (value) {
  return value.length;
}, 'Title cannot be blank');

/**
 * middlewares
 */
SecTreeSchema.pre('save', function (next) {
  if (this.parent === 'undefined' || this.parent.length == 0) {
    this.parent = -1;
  }
  next();
});

/**
 * Statics
 */
SecTreeSchema.statics.load = function (id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('SecTree', SecTreeSchema);
