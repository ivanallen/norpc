/**
 * @file 文件介绍
 * @author liufeng
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */

const ReqEncoder = require('./req_encoder');
const ResDecoder = require('./res_decoder');
const http = require('http');

/**
 * rpc 客户端
 *
 * @class
 */
class RpcClient {
    constructor(options) {
        this._options = options;
        this._options.method = 'POST';
    }

    request(method, ...argv) {
        return new Promise((resolve, reject) => {
            let req = http.request(this._options, res => {
                let decoder = new ResDecoder(res);
                resolve(decoder.parse());
            });
            req.on('abort', error => {
                console.error(error);
            });
            req.on('error', error => {
                console.error(error.stack);
            });
            let encoder = new ReqEncoder(req);
            encoder.write(method, ...argv);
        });
    }
}

module.exports = RpcClient;

