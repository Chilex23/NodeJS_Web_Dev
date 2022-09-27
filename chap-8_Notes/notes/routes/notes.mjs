import util from "util";
import express from "express";
import { ensureAuthenticated } from "./users.mjs";
import * as notes from "../models/notes.mjs";
import async from "hbs/lib/async.js";
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
