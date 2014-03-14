'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    autoInc = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

autoInc.initialize(mongoose.connection);

/**
 * Secrets Tree Schema
 */
var SecTreeSchema = new Schema({
  id: Number,
  text: {
    type: String,
    trim: true
  },
  parent: {
    type: Number,
    default: 0
  }
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
//SecTreeSchema.pre('save', function (next) {
//  if (this.parent === 'undefined' || this.parent.length == 0) {
//    this.parent = -1;
//  }
//  next();
//});
SecTreeSchema.pre('remove', function (next) {
  console.log('need to delete all the childs before parent');
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

SecTreeSchema.plugin(autoInc.plugin, {
  model: 'SecTree',
  field: 'id',
  startAt: 1
});

mongoose.model('SecTree', SecTreeSchema);
