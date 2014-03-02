var jsSHA = require('./jssha-1.31.min');
var crypto = require('crypto');
var b32 = require('thirty-two');

var otp = {};

module.exports = otp;

otp.verify = function (key, token, opt) {
  return (this.gen(key, opt) === token);
};

otp.genKey = function (secret, length) {
  var len = length || 16;
  if (secret && secret.length) {
    return b32.encode(secret).substring(1, len + 1);
  } else {
    var keyBytes = crypto.randomBytes(len).toString('Base64');
    return b32.encode(keyBytes).substring(1, len + 1);
  }

};

otp.gen = function (secret, opt) {
  var lopt = opt || {};
  var time = lopt.time || 30;
  var _t = new Date().getTime();
  var len = lopt.length || 16;

  // Time has been overwritten.
  if (lopt._t) {
    console.log('#####################################');
    console.log('# NOTE: TOTP TIME VARIABLE HAS BEEN #');
    console.log('# OVERWRITTEN.  THIS SHOULD ONLY BE #');
    console.log('# USED FOR TEST PURPOSES.           #');
    console.log('#####################################');
    _t = lopt._t;
  }
  var key = base32tohex(secret);
  var epoch = Math.round(_t / 1000.0);
  var time = leftpad(dec2hex(Math.floor(epoch / time)), len, '0');

  // external library for SHA functionality
  var hmacObj = new jsSHA(time, "HEX");
  var hmac = hmacObj.getHMAC(key, "HEX", "SHA-1", "HEX");
  //var hmac = crypto.createHmac('SHA1', new Buffer(key));

  var offset;
  if (hmac !== 'KEY MUST BE IN BYTE INCREMENTS') {
    offset = hex2dec(hmac.substring(hmac.length - 1));
  }

  var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
  return (otp).substr(otp.length - 6, 6).toString();
};

var dec2hex = function (s) {
  return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
};

var hex2dec = function (s) {
  return parseInt(s, 16);
};

var base32tohex = function (base32) {
  var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  var bits = "";
  var hex = "";

  for (var i = 0; i < base32.length; i++) {
    var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    bits += leftpad(val.toString(2), 5, '0');
  }

  for (i = 0; i + 4 <= bits.length; i += 4) {
    var chunk = bits.substr(i, 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }

  return hex;
};

var leftpad = function (str, len, pad) {
  if (len + 1 >= str.length) {
    str = new Array(len + 1 - str.length).join(pad) + str;
  }
  return str;
};