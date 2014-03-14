'use strict';

// Otps routes use Otps controller
var mongoose = require('mongoose');
var restify = require('express-restify-mongoose');
var Secret = mongoose.model('Secret');
var SecTree = mongoose.model('SecTree');
var Secrets = require('../controllers/secrets');
var SecTreeCtrl = require('../controllers/sectree');
var authorization = require('./middlewares/authorization');

module.exports = function (app) {
  var delFn = function(req, res, next){
    if(req.method == "DELETE"){

    }
    next();
  };
  restify.defaults({
    version: '' //default is v1
  });
  restify.serve(app, Secret,
      { middleware: [ authorization.requiresLogin ]
      });
  restify.serve(app, SecTree,
      { middleware: [ authorization.requiresLogin,delFn],
        plural: false
      });
  app.param('secretId', Secrets.secret);

  app.get('/api/sectrees/nextid', SecTreeCtrl.nextID);
};