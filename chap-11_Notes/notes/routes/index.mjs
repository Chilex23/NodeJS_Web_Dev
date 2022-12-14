import util from "util";
import express from "express";
import { enableSocketio } from '../app';
import * as notes from "../models/notes.mjs";

export const router = express.Router();

import DBG from "debug";
const debug = DBG("notes:debug-index");
const error = DBG("notes:error-index");

/* GET Home Page. */
router.get("/", async (req, res, next) => {
  try {
    let notelist = await getKeyTitlesList();
    debug(`HOME / user=${req.user ? util.inspect(req.user) : "NOBODY"} cookies=${util.inspect(req.cookies)}`);
    debug(`notes: ${util.inspect(notelist)}`);
    res.render("index", {
      title: "Notes",
      notelist: notelist,
      user: req.user ? req.user : undefined,
      enableSocketio: enableSocketio()
    });
  } catch (e) {
    error(`INDEX FAIL ${e}`);
    next(e);
  }
});

async function getKeyTitlesList() {
  const keylist = await notes.keylist();
  let keyPromises = keylist.map((key) => {
    return notes.read(key).then((note) => {
      return { key: note.key, title: note.title };
    });
  });
  return Promise.all(keyPromises);
}

export function socketio(io) {
  let emitNoteTitles = async () => {
    const notelist = await getKeyTitlesList();
    debug(`socketio emitNoteTitles ${util.inspect(notelist)}`);
    io.of("/home").emit("notetitles", { notelist });
  };
  notes.events.on("notecreated", emitNoteTitles);
  notes.events.on("noteupdate", emitNoteTitles);
  notes.events.on("notedestroy", emitNoteTitles);
}
