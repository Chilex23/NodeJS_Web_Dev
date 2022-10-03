const fs = require("fs");

exports.deleteFile = function (fname, callback) {
  fs.stat(fname, (err, stats) => {
    if (err) callback(new Error(`the file ${fname} does not exist`));
    else {
      fs.unlink(fname, (err2) => {
        if (err) callback(new Error(`could not delete ${fname}`));
        else callback();
      });
    }
  });
};
