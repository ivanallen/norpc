/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/

const _ = require('underscore');
const stream = require('stream');
const ReqDecoder = require('./req_decoder');
const ResEncoder = require('./res_encoder');

class RpcServer {
    constructor(readStream, writeStream) {
        this._readStream = readStream;
        this._writeStream = writeStream;
    }

    parse() {
        let decoder = new ReqDecoder(this._readStream);
        return decoder.parse();
    }

    write(res) {
        let encoder = new ResEncoder(this._writeStream);
        return encoder.write(res);
    }
}

module.exports = RpcServer;

