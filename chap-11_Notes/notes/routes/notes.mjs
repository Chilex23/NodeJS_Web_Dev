import util from "util";
import express from "express";
import { ensureAuthenticated } from "./users.mjs";
import { enableSocketio } from '../app';
import * as notes from "../models/notes.mjs";
import * as messages from '../models/messages-sequelize.mjs';
// import async from "hbs/lib/async.js";

import DBG from 'debug';
const debug = DBG('notes:router-users'); 
const error = DBG('notes:error-notes'); 

export const router = express.Router();

// Add Note.
router.get("/add", ensureAuthenticated, (req, res, next) => {
  try {
    res.render("noteedit", {
      title: "Add a Note",
      docreate: true,
      notekey: "",
      user: req.user,
      note: undefined,
      enableSocketio: enableSocketio()
    });
  } catch (e) {
    next(e);
  }
});

// Save Note (update)
router.post("/save", ensureAuthenticated, async (req, res, next) => {
  let note;
  if (req.body.docreate === "create") {
    note = await notes.create(req.body.notekey, req.body.title, req.body.body);
  } else {
    note = await notes.update(req.body.notekey, req.body.title, req.body.body);
  }
  res.redirect("view?key=" + note.key);
});

// Read Note (read)
router.get("/view", async (req, res, next) => {
  try {
    let note = await notes.read(req.query.key);
    res.render("noteview", {
      title: note ? note.title : "",
      notekey: req.query.key,
      user: req.user ? req.user : undefined,
      note: note,
      enableSocketio: enableSocketio()
    });
  } catch (e) {
    next(e);
  }
});

// Edit note (update)
router.get("/edit", ensureAuthenticated, async (req, res, next) => {
  try {
    let note = await notes.read(req.query.key);
    res.render("noteedit", {
      title: note ? "Edit " + note.title : "Add a Note",
      docreate: false,
      notekey: req.query.key,
      user: req.user ? req.user : undefined,
      note: note,
      enableSocketio: enableSocketio()
    });
  } catch (e) {
    next(e);
  }
});

// Ask to Delete note (destroy)
router.get("/destroy", ensureAuthenticated, async (req, res, next) => {
  try {
    let note = await notes.read(req.query.key);
    res.render("notedestroy", {
      title: note ? `Delete ${note.title}` : "",
      notekey: req.query.key,
      user: req.user ? req.user : undefined,
      note: note,
      enableSocketio: enableSocketio()
    });
  } catch (e) {
    next(e);
  }
});

//Really destroy note (destroy)
router.post("/destroy/confirm", ensureAuthenticated, async (req, res, next) => {
  await notes.destroy(req.body.notekey);
  res.redirect("/");
});

// Save incoming message to message pool, then broadcast it
router.post("/make-comment", ensureAuthenticated, async (req, res, next) => {
  try {
    await messages.postMessage(
      req.body.from,
      req.body.namespace,
      req.body.message
    );
    res.status(200).json({});
  } catch (err) {
    res.status(500).end(err.stack);
  }
});

// Delete the indicated message
router.post("/del-message", ensureAuthenticated, async (req, res, next) => {
  try {
    await messages.destroyMessage(req.body.id, req.body.namespace);
    res.status(200).json({});
  } catch (err) {
    res.status(500).end(err.stack);
  }
});

export function socketio(io) {
  io.of("/view").on("connection", function (socket) {
    // 'cb' is a function sent from the browser, to which we
    // send the messages for the named note.
    debug(`/view connected on ${socket.id}`);
    socket.on("getnotemessages", (namespace, cb) => {
      debug("getnotemessages " + namespace);
      messages
        .recentMessages(namespace)
        .then(cb)
        .catch((err) => console.error(err.stack));
    });
  });

  messages.emitter.on("newmessage", (newmsg) => {
    io.of("/view").emit("newmessage", newmsg);
  });

  messages.emitter.on("destroymessage", (data) => {
    io.of("/view").emit("destroymessage", data);
  });

  notes.events.on('noteupdate', newnote => {
    io.of('/view').emit('noteupdate', newnote);
  });
  notes.events.on('notedestroy', data => {
    io.of('/view').emit('notedestroy', data);
  });
};