/**
 * Module dependencies.
 */
var oauth2orize = require("oauth2orize");
var passport = require("passport");
var _ = require("lodash");
var log = require("../libs/log")(module);
var User = require("../api/customer/customer.model");
var crypto = require("crypto");
var config = require("../config/environment");
var jwt = require("jsonwebtoken");
var auth = require("./auth");

var server = oauth2orize.createServer();
console.log("outh2");

console.log(
  "executing......................................................................."
);
server.exchange(
  oauth2orize.exchange.password(function(
    client,
    username,
    password,
    scope,
    done
  ) {
    console.log(
      "oauth password exchange//////////////////////////: " +
        client +
        ", " +
        username +
        ", " +
        password
    );
    // Validate the user
    User.findOne({ email: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.authenticate(password)) {
        console.log("user pwd errr1");

        return done(null, false);
      }
      /*if (!_.find(user.apps, client.app)) {
			return done(null, false);
		}*/

      var tokenPayload = {
        userId: user._id,
        email: user.email,
        client: client
      };

      var accessToken = jwt.sign(tokenPayload, config.secrets.accessToken, {
        expiresIn: config.token.expiresInMinutes * 60
      });

      if (user.tokens.length > 0) {
        for (var i = 0; i < user.tokens.length; i++) {
          var token = user.tokens[i];
          if (token.appClient === JSON.stringify(client._id)) {
            log.info("Client already exist");
            return done(null, accessToken, token.refreshToken, {
              expires_in: config.token.expiresInMinutes * 60
            });
          }
        }
      }

      var refreshTokenPayload = {
        userId: user._id,
        email: user.email,
        client: client
      };
      var refreshToken = jwt.sign(
        refreshTokenPayload,
        config.secrets.refreshToken
      );

      var token = {
        appClient: client._id,
        accessToken: accessToken,
        refreshToken: refreshToken,
        lastAccess: new Date()
      };
      User.update({ _id: user._id }, { tokens: token }, function(
        err,
        numAffected
      ) {
        if (err) {
          return done(null, false);
        }
        return done(null, accessToken, refreshToken, {
          expires_in: config.token.expiresInMinutes * 60
        });
      });
    });
  })
);
server.exchange(
  oauth2orize.exchange.refreshToken(function(
    client,
    refreshToken,
    scope,
    done
  ) {
    jwt.verify(refreshToken, config.secrets.refreshToken, function(
      err,
      tokenPayload
    ) {
      if (err) {
        return done(err);
      }
      if (client._id != tokenPayload.client._id) {
        return done(null, false);
      }
      if (client.secret != tokenPayload.client.secret) {
        return done(null, false);
      }
      User.findById(tokenPayload.userId, function(err, user) {
        //console.log("user:", user);
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }

        var newTokenPayload = {
          userId: user._id,
          email: user.email,
          client: client
        };
        var accessToken = jwt.sign(
          newTokenPayload,
          config.secrets.accessToken,
          { expiresIn: config.token.expiresInMinutes * 60 }
        );

        var token = {
          appClient: client._id,
          accessToken: accessToken,
          refreshToken: refreshToken
        };
        User.update(
          { _id: user._id, "tokens.appClient": client._id },
          { $set: { "tokens.$": token } },
          function(err, numAffected) {
            if (numAffected == 0 && err && err.code === 16836) {
              // Document not updated so you can push onto the array
              User.update(
                { _id: user._id },
                { $push: { tokens: token } },
                function(err, numAffected) {
                  if (err) {
                    console.log(err);
                    return done(null, false);
                  }

                  return done(null, accessToken, null, {
                    expires_in: config.token.expiresInMinutes * 60
                  });
                }
              );
            } else {
              if (err) {
                console.log(err);
                return done(null, false);
              }
              return done(null, accessToken, null, {
                expires_in: config.token.expiresInMinutes * 60
              });
            }
          }
        );
      });
    });
  })
);
exports.token = [
  passport.authenticate(["basic", "oauth2-client-password"], {
    session: false
  }),
  server.token(),
  server.errorHandler()
];
