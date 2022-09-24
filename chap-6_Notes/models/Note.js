const notekey = Symbol("key");
const notetitle = Symbol("title");
const notebody = Symbol("body");

module.exports = class Note {
  constructor(key, title, body) {
    this[notekey] = key;
    this[notetitle] = title;
    this[notebody] = body;
  }
  get key() {
    return this[notekey];
  }
  get title() {
    return this[notetitle];
  }
  set title(newTitle) {
    this[notetitle] = newTitle;
  }
  get body() {
    return this[notebody];
  }
  set body(newBody) {
    this[notebody] = newBody;
  }
};
