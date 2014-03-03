'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Otp = mongoose.model('Otp'),
    config = require('./config'),
    LocalOtpStrategy = require('../app/lib/passport-lotp'),
    totp = require('../app/lib/otp');


module.exports = function(passport) {

    // Serialize the user id to push into the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserialize the user object based on a pre-serialized token
    // which is the user id
    passport.deserializeUser(function(id, done) {
        User.findOne({
            _id: id
        }, '-salt -hashed_password', function(err, user) {
            done(err, user);
        });
    });

    // Use local strategy
    passport.use(new LocalOtpStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, otp, done) {
            User.findOne({
                email: email
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
                if (password && !user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
                if(otp){
                  if(user.otp){
                    Otp.findOne({_id: user.otp},function(err,sotp){
                      if(!err){
                        if(!totp.verify(sotp.key,otp)){
                          return done(null, false, {
                            message: 'OTP not valid'
                          });
                        }
                      }else{
                        return done(null, false, {
                          message: 'OTP not found for User'
                        });
                      }
                    });
                  }else{
                    return done(null, false, {
                      message: 'OTP not active for User'
                    });
                  }
                }
                return done(null, user);
            });
        }
    ));
};