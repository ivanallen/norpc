/**
 * @file 文件介绍
 * @author liufeng27@baidu.com
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */

const stream = require('stream');
const PassThrough = stream.PassThrough;
const NoRpcError = require('./norpc_error');

const MAGIC = 0x6370726e;
const HEAD_LENGTH = 48;

/**
 * 解码器基类，需要用户实现 _parse 函数
 * 对于服务端来说，需要解码客户端传来的数据，返回方法名和参数列表
 *
 * @class
 */
class Decoder {
    constructor(readStream) {
        this._readStream = readStream;
        this._buffer = new Buffer([]);
        this._readStream.on('error', error => {
            console.error(error.stack);
        });
        this._readStream.on('abort', () => {
            console.error('client abort');
        });
        this._readStream.on('close', () => {
            console.error('client close');
        });
    }

    /**
     * 将读流中的数据解码成函数名，参数列表。
     *
     * @return {Promise} - [method, argv]
     *      argv 是数组，函数参数。
     */
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

    /**
     * 异步从流中读取 n 字节。此方法要么返回 n 字节数据，要么返回 null
     *
     * @param {integer} n - 要读取的字节数
     * @return {Promise} - Buffer
     */
    _readn(n) {
        if (n === 0) {
            return Promise.resolve(new Buffer([]));
        }
        let readPromise = this._createPromise();
        this._readStream.once('end', () => {
            // 提前结束，但是没读取到 n 字节数据。
            readPromise.reject(new NoRpcError('short data'));
        });
        this._readStream.once('abort', () => {
            readPromise.reject(new NoRpcError('request abort'));
        });
        this._readStream.once('error', error => {
            readPromise.reject(new NoRpcError('request error'));
        });
        // 异步读 n 字节
        let _readn = n => {
            let chunk = this._readStream.read(n);
            if (chunk === null) {
                return false;
            }
            if (chunk.length < n) {
                readPromise.reject(new NoRpcError('short read'));
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

    /**
     * 读取 48 字节协议头
     *
     * @return {Promise} - Object
     */
    _getHeader() {
        return this._readn(HEAD_LENGTH).then(chunk => {
            let header = {};
            header.magic = chunk.readUInt32LE(0);
            if (header.magic !== MAGIC) {
                console.error('magic:%s', header.magic.toString(16));
                return new NoRpcError('invalid header');
            }
            header.version = chunk.readUInt32LE(4);
            header.jsonBodyLen = chunk.readUInt32LE(44);
            return header;
        });
    }

    /**
     * 读取 json 头
     *
     * @param {Buffer} header - 协议头
     * @return {Promise} - Object
     *      json 头有两种，一种是客户端请求 json 头。格式如下：
     *           {
     *              method: 方法名
     *              describes: [
     *                  {type: 参数类型, length: 参数长度}
     *                  ...
     *              ]
     *           }
     *       另一种是服务端 rpc 函数调用时返回数据的描述信息：
     *          {
     *              type: 数据类型,
     *              length: 数据长度
     *          }
     *       type 类型主要有 string, integer, float, json, raw, stream
     *       对于 integer, float 和 stream 来说，length 字段是不必要的。
     *       这里的 integer 是 int32，而 float 是指 float64
     */
    _getJsonBodyByHeader(header) {
        let readJsonBodyPromise = this._createPromise();
        return this._readn(header.jsonBodyLen).then(chunk => {
            if (!chunk || chunk.length < header.jsonBodyLen) {
                readJsonBodyPromise.reject(new NoRpcError('short json body'));
                return;
            }
            try {
                let jsonBody = JSON.parse(chunk);
                return jsonBody;
            } catch (error) {
                return new NoRpcError('invalid json body');
            }
        });
    }

    /**
     * 根据数据描述信息读取数据
     *
     * @param {Object} describe
     *      {string} describe.type - 数据类型
     *      {integer} describe.length - 数据长度
     * @return {mixed} - 返回解析后的数据
     */
    _getData(describe) {
        if (describe.type === 'error') {
            return this._readn(describe.length).then(chunk => {
                return JSON.parse(chunk);
            }).then(e => {
                e.message = e.message;
                if (e.name === 'NoRpcError') {
                    let err = new NoRpcError(e.message);
                    err.stack = e.stack;
                    return Promise.reject(err);
                } else {
                    let err = new Error(e.message);
                    err.stack = e.stack;
                    return Promise.reject(err);
                }
            });
        } else if (describe.type === 'raw') {
            return this._readn(describe.length).then(chunk => {
                return chunk;
            });
        } else if (describe.type === 'string') {
            return this._readn(describe.length).then(chunk => {
                return chunk.toString();
            });
        } else if (describe.type === 'number') {
            return this._readn(8).then(chunk => {
                return chunk.readDoubleLE();
            });
        } else if (describe.type === 'json') {
            return this._readn(describe.length).then(chunk => {
                return JSON.parse(chunk);
            });
        } else if (describe.type === 'stream') {
            this._readStream.once('error', error => {
                console.error(error.stack);
            });
            this._readStream.once('abort', () => {
                console.error('read stream abort');
            });
            this._readStream.once('close', () => {
                console.log('read stream close');
            });
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
