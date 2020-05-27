"use strict";

var express = require("express");
var controller = require("./appclient.controller");
var middleMulter = require("multer")
var router = express.Router();

router.get("/", controller.index);
router.post("/create", controller.create);
router.get("/:mob", controller.show)
router.put("/:mob", controller.update);
router.delete("/:mob", controller.destroy);
router.delete("/upload", middleMulter, controller.destroy);

module.exports = router;