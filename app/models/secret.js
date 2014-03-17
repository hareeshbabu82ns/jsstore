'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Secret Schema
 */
var SecretSchema = new Schema({
  title: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    trim: true
  },
  pwd: {
    type: String
  },
  note: {
    type: String,
    trim: true
  },
  modified: {
    type: Date,
    default: Date.now
  },
  parent: {
    type: Schema.ObjectId,
    ref: 'SecTree'
  },
  favorite:{
    type: Boolean,
    default: false
  }
});

/**
 * Validations
 */
SecretSchema.path('title').validate(function (value) {
  return value.length;
}, 'Title cannot be blank');


/**
 * Statics
 */
SecretSchema.statics.load = function (id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Secret', SecretSchema);
