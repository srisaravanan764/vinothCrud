/**
 * Main application file
 */

"use strict";

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || "development";
const port = normalizePort(process.env.PORT || "3002");
const unhandledRejections = new Map();
const express = require("express");
const mongoose = require("mongoose");
const Agenda = require("agenda");
const config = require("./config/environment");
const debug = require("debug")("http");
const cluster = require("cluster");
const workers = process.env.WORKERS || require("os").cpus().length;
var cors = require("cors");
mongoose.set("useCreateIndex", true);
//mongoose.set('debug', true);
// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if (config.seedDB) {
  require("./config/seed");
}

// Setup server
const app = express();
app.use(cors());
const server = require("http").createServer(app);
require("./config/express")(app);
require("./routes")(app);

/**
 * Normalize a port into a number, string, or false.
 */

if (cluster.isMaster && process.env.NODE_ENV === "production") {
  for (var i = 0; i < workers; ++i) {
    var worker = cluster.fork().process;
    console.log("worker %s started.", worker.pid);
  }

  cluster.on("exit", function(worker) {
    console.log("worker %s died. restart...", worker.process.pid);
    cluster.fork();
  });
} else {
  // Start server
  server.listen(port, config.ip, function() {
    console.log(
      "Express server listening on %d, in %s mode",
      port,
      app.get("env")
    );
  });

  server.on("error", onError);
  server.on("listening", onListening);
}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

process.on("uncaughtException", function(err) {
  console.error(new Date().toUTCString() + " uncaughtException:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  unhandledRejections.set(promise, reason);
});
process.on("rejectionHandled", promise => {
  unhandledRejections.delete(promise);
});

// Expose app
exports = module.exports = app;
