'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    totp = require('../lib/otp'),
    Schema = mongoose.Schema;

/**
 * Otp Schema
 */
var OtpSchema = new Schema({
  title: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    default: 'TOTP',
    trim: true
  },
  key: {
    type: String,
    default: '',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Validations
 */
OtpSchema.path('title').validate(function (value) {
  return value.length;
}, 'Title cannot be blank');
OtpSchema.path('email').validate(function (value) {
  return value.length;
}, 'eMail cannot be blank');
OtpSchema.path('type').validate(function (value) {
  return /hotp|totp/i.test(value);
}, 'Key is not in[hotp,totp]');

//otpauth://totp/<email>?secret=<secret>[&issuer=<title>]
OtpSchema.virtual('otpURL').get(function () {
  return 'otpauth://' + this.type
      + '/' + this.email + '?secret='
      + this.key;
});

/**
 * middlewares
 */
OtpSchema.pre('save', function (next) {
  //generate Key if empty
  if (this.key === 'undefined' || this.key.length == 0) {
    this.key = totp.genKey();
  }
  next();
});

/**
 * Statics
 */
OtpSchema.statics.load = function (id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Otp', OtpSchema);
