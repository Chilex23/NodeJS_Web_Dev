import rfs from "rotating-file-stream";
import createError from "http-errors";
import fs from "fs-extra";
import url from "url";
import express from "express";
import hbs from "hbs";
import path from "path";
import util from "util";
import logger from "morgan";
import cookieParser from "cookie-parser";
import DBG from "debug";
const debug = DBG('notes:debug');
const error = DBG("notes:error");
import { router as indexRouter } from "./routes/index.mjs";
// const users = require('./routes/users');
import { router as notesRouter } from "./routes/notes.mjs";

// Workaround for lack of __dirname in ES6 modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// Register a partials folder
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "partials"));

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
//app.use('/users', usersRouter);

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

app.use(
  logger(process.env.REQUEST_LOG_FORMAT || "dev", {
    stream: logStream ? logStream : process.stdout,
  })
);

process.on("uncaughtException", function (err) {
  error("I've crashed!!! - " + (err.stack || err));
});

// if (app.get("env") === "development") {
//   app.use(function (err, req, res, next) {
//     // util.log(err.message);
//     res.status(err.status || 500);
//     error((err.status || 500) + " " + error.message);
//     res.render("error", {
//       message: err.message,
//       error: err,
//     });
//   });
// }

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  error((err.status || 500) + " " + error.message);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
