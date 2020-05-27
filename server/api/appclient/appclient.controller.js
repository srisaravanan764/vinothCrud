"use strict";

var _ = require("lodash");
var AppClient = require("./appclient.model");
var log = require("../../libs/log")(module);
var sendRsp = require("../../utils/response").sendRsp;
var MSG = require("../../config/message");
var util = require("util");

var fs = require("fs");

// Get list of appclients

exports.index = (req, res) => {
    var file = `${__dirname}/users.json`;
    fs.readFile(file, "utf8", (err, data) => {
        if (err) {
            return sendRsp(res, 500, "User gets failed", err);
        }
        return sendRsp(res, 200, "User gets success", JSON.parse(data));
    });
};

// Get a single appclient

// Creates a new appclient in the DB.

exports.create = (req, res) => {

    var createUserJson = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobile: req.body.mobile,
        age: req.body.age,
        email: req.body.email,
    };
    var fileName = `${__dirname}/users.json`;
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            return sendRsp(res, 500, "User inserted failed");
        } else {
            let obj = JSON.parse(data);
            obj.data.push(createUserJson);
            let json = JSON.stringify(obj);
            fs.writeFile(fileName, json, "utf8", () => {
                if (err) {
                    return sendRsp(res, 500, "User inserted failed");
                }
                return sendRsp(res, 200, "User inserted success");
            });
        }
    });
};

exports.show = (req, res) => {
    const email = req.params.mob ? req.params.mob : req.query.mob;
    console.log("email", email);
    var fileName = `${__dirname}/users.json`;
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            return sendRsp(res, 500, "User get data  failed");
        } else {
            let obj = JSON.parse(data);
            let searchValue = obj['data'].filter((data) => data.email == email.trim())
            return sendRsp(res, 200, "User get data success", searchValue);
        }
    });
};
// Updates an existing appclient in the DB.

exports.update = (req, res) => {
    const username = req.body.email ? req.body.email : req.params.mob;
    console.log("username", username);
    var fileName = `${__dirname}/users.json`;
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let obj = JSON.parse(data);
            let searchValue = obj["data"].findIndex(
                (data) => data.email ==
                username.trim()
            );
            obj['data'][searchValue]["firstName"] = req.body.firstName;
            obj['data'][searchValue]["lastName"] = req.body.lastName;
            obj['data'][searchValue]["age"] = req.body.age;
            obj['data'][searchValue]["mobile"] = req.body.mobile;
            let json = JSON.stringify(obj);
            fs.writeFile(fileName, json, "utf8", () => {
                if (err) {
                    return sendRsp(res, 500, "User updated failed");
                }
                return sendRsp(res, 200, "User updated success");
            });
        }
    });
};

// Deletes a appclient from the DB.

exports.destroy = async(req, res) => {
    const email = req.params.mob ? req.params.mob : req.query.mob;
    console.log("email", email);
    var fileName = `${__dirname}/users.json`;
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            return sendRsp(res, 500, "User get data  failed");
        } else {
            let obj = JSON.parse(data);
            let searchValue = obj["data"].findIndex(
                (data) => data.email ==
                email.trim()
            );
            delete obj['data'][searchValue]
            let json = JSON.stringify(obj);
            fs.writeFile(fileName, json, "utf8", () => {
                if (err) {
                    return sendRsp(res, 500, "User deleted failed");
                }
                return sendRsp(res, 200, "User deleted success");
            });
        }
    });
};