/* jshint esversion:6 */
const http = require('http');
const nrpc = require('../nrpc/nrpc');
const handlers = require('./handlers');

const server = http.createServer((req, res) => {
    nrpc.server(req, res, handlers).catch(error => {
        console.error(error.stack);
    });
});
server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
