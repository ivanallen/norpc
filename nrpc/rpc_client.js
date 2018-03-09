/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/

const _ = require('underscore');
const stream = require('stream');
const ReqEncoder = require('./req_encoder');
const ResDecoder = require('./res_decoder');
const http = require('http');

class RpcClient {
    constructor(options) {
        this._options = options;
    }

    request(method, ...argv) {
        return new Promise((resolve, reject) => {
            let req = http.request(this._options, res => {
                let decoder = new ResDecoder(res);    
                resolve(decoder.parse());
            });
            let encoder = new ReqEncoder(req);
            encoder.write(method, ...argv);
        });
    }
}

module.exports = RpcClient;

