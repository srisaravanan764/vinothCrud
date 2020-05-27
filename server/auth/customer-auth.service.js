"use strict";

var config = require("../config/environment");
var expressJwt = require("express-jwt");
var compose = require("composable-middleware");
var customerModel = require("../api/customer/customer.model");

var validateJwt = expressJwt({
  secret: config.secrets.accessToken
});

function isAuthenticated() {
  return (
    compose()
      // Validate jwt
      .use(function(req, res, next) {
        validateJwt(req, res, next);
      })

      .use(function(req, res, next) {
        customerModel.findById(
          req.user.userId,
          "-tokens -salt -hashed_password",
          function(err, Admin) {
            if (err) {
              return next(err);
            }
            if (Admin) {
              req.user = Admin;
              next();
            } else {
              return res.send(403);
            }
          }
        );
      })
  );
}

exports.isAuthenticated = isAuthenticated;
