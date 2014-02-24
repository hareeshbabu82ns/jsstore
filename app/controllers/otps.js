'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Otp = mongoose.model('Otp'),
    //notp = require('notp'),
    totp = require('../lib/otp'),
    http = require('http'),
    _ = require('lodash');

/**
 * Find article by id
 */
exports.otp = function (req, res, next, id) {
  Otp.load(id, function (err, otp) {
    if (err) return next(err);
    if (!otp) return next(new Error('Failed to load otp ' + id));
    req.otp = otp;
    next();
  });
};

/**
 * Generate One Time Password based on settings
 */
exports.generateOTP = function (req, res) {
  var otp = req.otp;
  if (otp.key && otp.key.length) {
    res.jsonp({otp: totp.gen(otp.key, {}),
      time: new Date().getTime()});
  } else
    res.jsonp({error: 'generate a Key, before using'});
};

/**
 * Create/Generate OTP key
 */
exports.updateKey = function (req, res) {
  var otp = req.otp;
  var body = req.body || {key:''};
//  console.log('key provided with '+ JSON.stringify(key));
  otp = _.extend(otp, body);
  if (body.key && body.key.length) {
    //user specific key
  } else {
    //generate OTP Key
    otp.key = totp.genKey();
  }
  //console.log('key updated with '+ otp.key);
  otp.save(function (err) {
    if (err) {
      res.jsonp({error: err});
    } else {
      res.jsonp({msg: "success"});
    }
  });
};

exports.genKey = function (req, res) {
  res.jsonp({qry: req.query, key: totp.genKey(req.query.key || '', parseInt(req.query.length))});
};

//http://localhost/phpqrcode/genqr.php?s=8&d=<otpauth://totp/<email>?secret=<secret>&issuer=<title>>
exports.genQR = function (req, res) {
  var otp = req.otp;
  var url = 'http://hareeshbabu.myds.me/phpqrcode/genqr.php?d='
      + otp.otpURL;
  console.log(url);
  http.get(url).on('response', function (resp) {
    var body = [];
    resp.on('data', function (chunk) {
      body.push(chunk);
    });
    resp.on('end', function () {
      res.writeHead(200, {'Content-Type': resp.headers['content-type'] });
      res.end(Buffer.concat(body), 'binary');
    });
  });
};

