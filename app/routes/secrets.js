'use strict';

// Otps routes use Otps controller
var mongoose = require('mongoose');
var restify = require('express-restify-mongoose');
var Secret = mongoose.model('Secret');
var Secrets = require('../controllers/secrets');
var authorization = require('./middlewares/authorization');

module.exports = function (app) {
  restify.defaults({
    version: '' //default is v1
  });
  restify.serve(app, Secret,
      { middleware: [ authorization.requiresLogin ]
      });

  app.param('secretId', Secrets.secret);

};