"use strict";

var express = require("express");
var controller = require("./customer.controller");
var user = require("../../auth/customer-auth.service");

var router = express.Router();
router.get("/", user.isAuthenticated(), controller.index);
router.get("/:id", user.isAuthenticated(), controller.show);
router.patch("/:id", user.isAuthenticated(), controller.update);
router.post("/", controller.createUser);
module.exports = router;
