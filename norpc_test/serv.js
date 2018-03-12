/* jshint esversion:6 */
const http = require('http');
const norpc = require('../norpc/norpc');
const handlers = require('./handlers');

const server = http.createServer((req, res) => {
    norpc.serve(req, res, handlers).catch(error => {
        console.error(error.stack);
    });
});
server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
