/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/


const _ = require('underscore');
const stream = require('stream');
const PassThrough = stream.PassThrough;

const MAGIC = 0xccbb0123;
const HEAD_LENGTH = 48;

class Decoder {
    constructor(readStream) {
        this._readStream = readStream;
        this._buffer = new Buffer([]);
    }

    parse() {
        return this._getJsonBody().then(jsonBody => {
            return this._parse(jsonBody);
        });
    }

    _createPromise() {
        let _resolve = null;
        let _reject = null;
        let p = new Promise((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });
        p.resolve = _resolve;
        p.reject = _reject;
        return p;
    }

    _readn(n) {
        if (n === 0) {
            return Promise.resolve(new Buffer([]));
        }
        let readPromise = this._createPromise();
        this._readStream.once('end', () => {
            readPromise.reject(new Error('short data'));
        });
        this._readStream.once('abort', () => {
            readPromise.reject(new Error('abort'));
        });
        // 异步读 n 字节
        let _readn = (n) => {
            let chunk = this._readStream.read(n);
            if (chunk === null) {
                return false;
            }
            if (chunk.length < n) {
                readPromise.reject(new Error('short read'));
                return false;
            }
            readPromise.resolve(chunk);
            return true;
        };
        let _run = () => {
            // 类似 epoll ET 模式，需要先读。否则可能不会触发 readable
            // 如果读不到数据，再注册 readable 事件。
            let r = _readn(n);
            if (r) {
                return;
            }

            this._readStream.once('readable', () => {
                if (!_readn(n)) {
                    _run();
                }
            });
        };
        _run();
        return readPromise;
    }

    _getHeader() {
        return this._readn(HEAD_LENGTH).then(chunk => {
            let header = {};
            header.magic = chunk.readUInt32LE(0);
            if (header.magic !== 0xccbb0123) {
                console.error('magic:%s', header.magic.toString(16));
                return new Error('invalid header');
            }
            header.version = chunk.readUInt32LE(4);
            header.jsonBodyLen = chunk.readUInt32LE(44);
            return header;
        });
    }

    _getJsonBodyByHeader(header) {
        let readJsonBodyPromise = this._createPromise();
        return this._readn(header.jsonBodyLen).then(chunk => {
            if (!chunk || chunk.length < header.jsonBodyLen) {
                readJsonBodyPromise.reject(new Error('short json body'));
                return;
            }
            try {
                let jsonBody = JSON.parse(chunk);
                return jsonBody;
            } catch (error) {
                return new Error('invalid json body');
            }
        });
    }

    _getData(describe) {
        if (describe.type === 'string') {
            return this._readn(describe.length).then(chunk => {
                return chunk.toString();
            });
        } else if (describe.type === 'integer') {
            return this._readn(4).then(chunk => {
                return chunk.readInt32LE();
            });
        } else if (describe.type === 'float') {
            return this._readn(8).then(chunk => {
                return chunk.readDoubleLE();
            });
        } else if (describe.type === 'json') {
            return this._readn(describe.length).then(chunk => {
                return JSON.parse(chunk);
            });
        } else if (describe.type === 'raw') {
            return this._readn(describe.length).then(chunk => {
                return chunk;
            });
        } else if (describe.type === 'stream') {
            let ss = new PassThrough();
            this._readStream.pipe(ss);
            return Promise.resolve(ss);
        }
        return Promise.resolve();
    }

    _getJsonBody() {
        return this._getHeader().then(header => {
            return this._getJsonBodyByHeader(header);
        });
    }
}

module.exports = Decoder;
