"use strict";

const express = require("express");
const controller = require("./store.controller");
const router = express.Router();


router.get("/", controller.getAllStores);
router.get("/:id", controller.getStore);
router.get("/search", controller.searchStores);
router.post("/count", controller.customerCount);
router.post("/", controller.createStore);
router.patch("/:id", controller.updateStore);

module.exports = router;
