/**
 * @file 文件介绍
 * @author liufeng
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */

const stream = require('stream');
const ReqDecoder = require('./req_decoder');
const ResEncoder = require('./res_encoder');

/**
 * rpc server 端
 *
 * @class
 */
class RpcServer {
    constructor(readStream, writeStream) {
        this._readStream = readStream;
        this._writeStream = writeStream;
    }

    parse() {
        let decoder = new ReqDecoder(this._readStream);
        return decoder.parse();
    }

    /**
     * 回写结果
     *
     * @param {mixed} res - rpc 函数的返回结果
     * @return {Promise}
     */
    write(res) {
        let encoder = new ResEncoder(this._writeStream);
        return encoder.write(res);
    }
}

module.exports = RpcServer;

