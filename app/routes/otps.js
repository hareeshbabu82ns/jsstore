'use strict';

// Otps routes use Otps controller
var mongoose = require('mongoose');
var restify = require('express-restify-mongoose');
var Otp = mongoose.model('Otp');
var Otps = require('../controllers/otps');
var authorization = require('./middlewares/authorization');

// Otp authorization helpers
var hasAuthorization = function (req, res, next) {
  if (req.otp && req.otp.user._id !== req.user._id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

module.exports = function (app) {
  restify.defaults({
    version: '' //default is v1
  });
  restify.serve(app, Otp,
      { middleware: [ authorization.requiresLogin, hasAuthorization],
        private: "key"
      });

  app.param('otpId', Otps.otp);

  app.get('/api/otp/:otpId/genotp', authorization.requiresLogin, Otps.generateOTP);
  app.post('/api/otp/:otpId/updkey', authorization.requiresLogin, Otps.updateKey);
  app.get('/api/otp/genkey', Otps.genKey);
  app.get('/api/otp/:otpId/genqr', Otps.genQR);
};