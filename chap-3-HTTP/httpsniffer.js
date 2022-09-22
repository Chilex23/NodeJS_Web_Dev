const util = require('util');
const url = require('url');

const timeStamp = () => new Date().toISOString();

exports.sniffOn = function(server) {
    server.on('request', (req, res) => {
        console.log(`${timeStamp()} e_request`);
        console.log(`${timeStamp()} ${reqToString(req)}`);
    });
    server.on('close', errno => { console.log(`${timeStamp()} e_close ${errno}`); });

    server.on('checkContinue', (req, res) => {
        console.log(`${timeStamp()} e_checkContinue`);
        console.log(`${timeStamp()} ${reqToString(req)}`);
        res.writeContinue();
    });

    server.on('upgrade', (req, socket, head) => {
        console.log(`${timeStamp()} e_upgrade`);
        console.log(`${timeStamp()} ${reqToString(req)}`);
    });

    server.on('clientError', () => { console.log(`${timeStamp()} e_clientError`); });
};

const reqToString = exports.reqToString = (req) => {
    let ret = `req ${req.method} ${req.httpVersion} ${req.url}` +'\n';
    ret += JSON.stringify(url.parse(req.url, true)) +'\n';
    let keys = Object.keys(req.headers);
    for (let i = 0, l = keys.length; i < l; i++) {
        let key = keys[i];
        ret += `${i} ${key}: ${req.headers[key]}` +'\n';
    }
    if (req.trailers) ret += util.inspect(req.trailers) +'\n';
    return ret;
};