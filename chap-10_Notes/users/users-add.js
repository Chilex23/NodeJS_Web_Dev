"use strict";

const util = require("util");
const restify = require("restify-clients");

let client = restify.createJsonClient({
  url: "http://localhost:" + process.env.PORT,
  version: "*",
});
client.basicAuth("them", "D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF");
client.post(
  "/create-user",
  {
    username: "me2",
    password: "w0rd2",
    provider: "local",
    familyName: "Ragnar",
    givenName: "Logbrok",
    middleName: "",
    emails: [],
    photos: [],
  },
  (err, req, res, obj) => {
    if (err) console.error('me', err.stack);
    else console.log("Created " + util.inspect(obj));
  }
);
