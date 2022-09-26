import fs from "fs-extra";
import path from "path";
import util from "util";
import Note from "./Note.mjs";
import { Level } from "level";
import DBG from "debug";
const debug = DBG("notes:notes-level");
const error = DBG("notes:error-level");

let db;

async function connectDB() {
  if (typeof db !== "undefined" || db) return db;
  db = new Level(process.env.LEVELDB_LOCATION || "notes.level", {
    createIfMissing: true,
    valueEncoding: "json",
  });
  return db;
}

async function crupdate(key, title, body) {
  const db = await connectDB();
  let note = new Note(key, title, body);
  await db.put(key, note.JSON);
  return note;
}

export function create(key, title, body) {
  return crupdate(key, title, body);
}

export function update(key, title, body) {
  return crupdate(key, title, body);
}

export async function read(key) {
  const db = await connectDB();
  let note = Note.fromJSON(await db.get(key));
  return new Note(note.key, note.title, note.body);
}

export async function destroy(key) {
  const db = await connectDB();
  await db.del(key);
}

export async function keylist() {
  const db = await connectDB();
  let keyz = [];
  for await (const [key, value] of db.iterator()) {
    keyz.push(key);
  }
  return keyz;
}

export async function count() {
  const db = await connectDB();
  let total = db.iterator().count;
  return total;
}

export async function close() {
  let _db = db;
  db = undefined;
  return _db ? _db.close() : undefined;
}
