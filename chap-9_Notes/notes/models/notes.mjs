import util from "util";
import DBG from "debug";
const debug = DBG("notes:notes-notes");
const error = DBG("notes:error-notes");
import _events from "./notes-events.mjs";
export const events = _events;

let TheModule;

async function model() {
  if (TheModule) return TheModule;
  TheModule = await import(`../models/notes-${process.env.NOTES_MODEL}.mjs`);
  return TheModule;
}

export async function create(key, title, body) {
  const note = await (await model()).create(key, title, body);
  debug(`note created ${util.inspect(note)}`);
  _events.noteCreated(note);
  return note;
}

export async function update(key, title, body) {
  const note = await (await model()).update(key, title, body);
  debug(`note updated ${util.inspect(note)}`);
  _events.noteUpdate({ key: note.key, title: note.title, body: note.body });
  return note;
}

export async function read(key) {
  return (await model()).read(key);
}

export async function destroy(key) {
  await (await model()).destroy(key);
  debug(`note destroyed ${util.inspect(key)}`);
  _events.noteDestroy({ key });
  return key;
}

export async function keylist() {
  return (await model()).keylist();
}
export async function count() {
  return (await model()).count();
}
export async function close() {
  return (await model()).close();
}
