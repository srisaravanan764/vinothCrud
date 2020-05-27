"use strict";

var config = require("../../config/environment");
var MSG = require("../../config/message");
var sendRsp = require("../../utils/response").sendRsp;
var log = require("../../libs/log")(module);
var request = require("request");
var _ = require("lodash");
var crypto = require("../../auth/encrypt-decrypt");
var jwtDecode = require("jwt-decode");
const customerModel = require("../customer/customer.model");
const util = require("util");

//Check for valid username & password and generate otp if valid.

exports.login = (req, res) => {
  req.checkBody("username", "MissingQueryParams").notEmpty();
  req.checkBody("password", "MissingQueryParams").notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    log.error(MSG.GLOBAL_VALUES.missingParamsMsg);
    sendRsp(res, 400, MSG.GLOBAL_VALUES.missingParamsMsg, util.inspect(errors));
    return;
  }
  try {
    const params = req.body;
    const clientId = config.auth.clientId;
    const clientSecret = config.auth.clientSecret;
    params.grant_type = "password";
    const authCode = new Buffer(clientId + ":" + clientSecret).toString(
      "base64"
    );
    try {
      request.post(
        {
          url: config.auth.saUrl,
          form: params,
          headers: {
            Authorization: "Basic " + authCode
          }
        },
        async (err, response, body) => {
          if (err) {
            log.error(err.message, res.statusCode, err.message);
            return sendRsp(res, 500, MSG.USER_AUTH.errorMsg);
          }

          if (response.statusCode == 403 || response.statusCode == 401) {
            sendRsp(res, 401, MSG.USER_AUTH.InvalidErrorMsg);
            return;
          }
          try {
            const rspTokens = new Object();
            const tokenJSON = JSON.parse(body);
            const refreshToken = tokenJSON.refresh_token;
            rspTokens["access_token"] = tokenJSON.access_token;
            rspTokens["expires_in"] = tokenJSON.expires_in;
            rspTokens["token_type"] = tokenJSON.token_type;
            const encryptedRefToken = crypto.encrypt(refreshToken);
            const customer_details = jwtDecode(rspTokens.access_token);
            rspTokens["username"] = customer_details.email;
            rspTokens["email"] = customer_details.email;
            rspTokens["id"] = customer_details.userId;
            rspTokens["refreshToken"] = encryptedRefToken;
            res.cookie("admin_refresh_token", encryptedRefToken);
            log.info("200", MSG.USER_AUTH.successMsg);
            return sendRsp(res, 200, MSG.USER_AUTH.successMsg, rspTokens);
          } catch (err) {
            console.log("response final  err", err);
            log.info("400", MSG.USER_AUTH.errorMsg);
            return sendRsp("400", MSG.USER_AUTH.errorMsg);
          }
        }
      );
    } catch (err) {
      console.log("response final  err", err);
      log.info("400", MSG.USER_AUTH.errorMsg);
      return sendRsp("400", MSG.USER_AUTH.errorMsg);
    }
  } catch (err) {
    console.log("response final  err", err);
    log.info("400", MSG.USER_AUTH.errorMsg);
    return sendRsp("400", MSG.USER_AUTH.errorMsg);
  }
};

exports.refreshToken = (req, res) => {
  if (!req.body.admin_refresh_token) {
    log.error(MSG.USER_AUTH.refreshTokenMissing);
    sendRsp(res, 403, MSG.USER_AUTH.refreshTokenMissing);
    return;
  }

  var decryptedRefToken = crypto.decrypt(req.body.admin_refresh_token);

  customerModel.find(
    {
      email: req.body.email
    },
    function(err, user) {
      if (err) {
        log.error(
          MSG.USER_AUTH.errorMsgGetSingular,
          res.statusCode,
          err.message
        );
        return sendRsp(res, 500, MSG.USER_AUTH.errorMsgGetSingular);
      }

      if (user.length > 0) {
        var tokens = user[0].tokens;
        var flag = false;
        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i].refreshToken === decryptedRefToken) {
            flag = true;
          }
        }
        if (!flag) {
          log.error(MSG.USER_AUTH.refreshTokenMismatchError);
          sendRsp(res, 403, MSG.USER_AUTH.refreshTokenMismatchError);
          return;
        }
        var params = {};
        params.refresh_token = decryptedRefToken;
        var clientId = config.auth.clientId;
        var clientSecret = config.auth.clientSecret;
        params.grant_type = "refresh_token";

        var authCode = new Buffer(clientId + ":" + clientSecret).toString(
          "base64"
        );

        request.post(
          {
            url: config.auth.saUrl,
            form: params,
            headers: {
              Authorization: "Basic " + authCode
            }
          },
          function(err, response, body) {
            if (err) {
              log.error(MSG.USER_AUTH.errorMsg, res.statusCode, err.message);
              return sendRsp(res, 500, MSG.USER_AUTH.errorMsg);
            }

            if (!err) {
              log.info("200", MSG.USER_AUTH.successMsg);
              return sendRsp(
                res,
                200,
                MSG.USER_AUTH.successMsg,
                JSON.parse(body)
              );
            }
          }
        );
      } else {
        res.clearCookie("admin_refresh_token");
        log.error("403", MSG.USER_AUTH.notFoundMSg);
        return sendRsp(res, 403, MSG.USER_AUTH.notFoundMSg);
      }
    }
  );
};

exports.logout = (req, res) => {
  try {
    var refToken = crypto.decrypt(req.body.refreshToken);
    customerModel.update(
      {
        _id: req.user._id
      },
      {
        $pull: {
          tokens: {
            refreshToken: refToken
          }
        }
      },
      (err, result) => {
        if (err) {
          log.error(MSG.USER_AUTH.errorMsg, res.statusCode, err.message);
          return sendRsp(res, 500, MSG.USER_AUTH.errorMsg);
        }
        if (!err) {
          log.info("200", MSG.USER_AUTH.logoutSuccessMsg);
          res.clearCookie("admin_refresh_token");
          return sendRsp(res, 200, MSG.USER_AUTH.logoutSuccessMsg);
        } else {
          log.error(MSG.USER_AUTH.errorMsg, res.statusCode, err.message);
          return sendRsp(res, 500, MSG.USER_AUTH.errorMsg);
        }
      }
    );
  } catch (err) {
    return sendRsp(res, 500, MSG.USER_AUTH.errorMsg + err);
  }
};
