"use strict";

const express = require("express");
const controller = require("./auth.controller");
const auth = require("../../auth/customer-auth.service");
const router = express.Router();

router.post("/login", controller.login);
router.post("/logout", auth.isAuthenticated(), controller.logout);
router.post("/refresh_token", auth.isAuthenticated(), controller.refreshToken);
module.exports = router;
