"use strict";
const express = require("express");
const controller = require("./user.controller");
const router = express.Router();


router.post("/", controller.createUser);
router.patch("/", controller.updateUser);
router.get("/:id", controller.getUser);
router.get("/store/:id", controller.getAllUsers);
module.exports = router;
