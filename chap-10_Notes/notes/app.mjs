#!/usr/bin/env node

import rfs from "rotating-file-stream";
import createError from "http-errors";
import fs from "fs-extra";
import url from "url";
import express from "express";
import hbs from "hbs";
import path from "path";
import util from "util";
import logger from "morgan";
import http from "http";
import cookieParser from "cookie-parser";
import DBG from "debug";

const debug = DBG("notes:debug");
const error = DBG("notes:error");

import passportSocketIo from "passport.socketio";
import session from "express-session";
import sessionFileStore from "session-file-store";
const FileStore = sessionFileStore(session);

export const sessionCookieName = "notescookie.sid";
const sessionSecret = "keyboard mouse";
const sessionStore = new FileStore({ path: "sessions" });

import { socketio as indexSocketio, router as indexRouter } from './routes/index.mjs';
import { router as usersRouter, initPassport } from "./routes/users.mjs";
import { socketio as notesSocketio, router as notesRouter } from "./routes/notes.mjs";

// Workaround for lack of __dirname in ES6 modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

export default app;

/**
 * Create HTTP server.
*/
const server = http.createServer(app);
import socketio from "socket.io";
const io = socketio(server);

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: sessionCookieName,
    secret: sessionSecret,
    store: sessionStore,
  })
);

/**
 * Get port from environment and store in Express.
*/

let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
*/

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

let logStream;
// Log to a file if requested
if (process.env.REQUEST_LOG_FILE) {
  (async () => {
    let logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
    await fs.ensureDir(logDirectory);
    logStream = rfs(process.env.REQUEST_LOG_FILE, {
      size: "10M", // rotate every 10 MegaBytes written
      interval: "1d", // rotate daily
      compress: "gzip", // compress rotated files
    });
  })().catch((err) => {
    console.error(err);
  });
}

app.use(session({ 
  store: sessionStore, 
  secret: sessionSecret,
  resave: true, 
  saveUninitialized: true,
  name: sessionCookieName
})); 
initPassport(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// Register a partials folder
hbs.registerPartials(path.join(__dirname, "partials"));

app.use(
  logger(process.env.REQUEST_LOG_FORMAT || "dev", {
    stream: logStream ? logStream : process.stdout,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/assets/vendor/feathericons",
  express.static(path.join(__dirname, "node_modules", "feather-icons", "dist"))
);

app.use("/", indexRouter);
app.use("/notes", notesRouter);
app.use("/users", usersRouter);

io.on('connection', function(socket){
  debug('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

indexSocketio(io);
notesSocketio(io);

process.on("uncaughtException", function (err) {
  error("I've crashed !!! - " + (err.stack || err));
});

process.on("unhandledRejection", (reason, p) => {
  error(`Unhandled Rejection at: ${util.inspect(p)} reason: ${reason}`);
});

if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    // util.log(err.message);
    res.status(err.status || 500);
    error((err.status || 500) + " DEV ERROR " + err.stack);
    // error(util.inspect(err));
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
} 

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  error(`APP ERROR HANDLER ${err.stack}`);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  error((err.status || 500) + " " + err.message);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

function normalizePort(val) {
  let port = parseInt(val, 10);

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

  let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

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
  let addr = server.address();
  let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
