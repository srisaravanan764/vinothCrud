var passport = require("passport");
var BasicStrategy = require("passport-http").BasicStrategy;
var ClientPasswordStrategy = require("passport-oauth2-client-password")
  .Strategy;
var Appclient = require("../api/appclient/appclient.model");

passport.use(
  new BasicStrategy(function(clientId, clientSecret, done) {
    Appclient.findById(clientId, function(err, client) {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      if (client.secret != clientSecret) {
        console.log("secrests not matching..............");
        return done(null, false);
      }
      console.log("secrests  matching..............");
      return done(null, client);
    });
  })
);

passport.use(
  new ClientPasswordStrategy(function(clientId, clientSecret, done) {
    console.log("client password strategy: " + clientId + ", " + clientSecret);
    Appclient.findById(clientId, function(err, client) {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      if (client.secret != clientSecret) {
        return done(null, false);
      }
      return done(null, client);
    });
  })
);
