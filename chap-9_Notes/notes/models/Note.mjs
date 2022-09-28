const notekey = Symbol("key");
const notetitle = Symbol("title");
const notebody = Symbol("body");

export default class Note {
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

  get JSON() {
    return JSON.stringify({
      key: this.key,
      title: this.title,
      body: this.body,
    });
  }

  static fromJSON(json) {
    let data = JSON.parse(json);
    let note = new Note(data.key, data.title, data.body);
    return note;
  }
}
