/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/
const Decoder = require('./decoder');

class ReqDecoder extends Decoder {
    constructor(readStream) {
        super(readStream);
    }

    _parse(jsonBody) {
        let describes = jsonBody.describes;
        let method = jsonBody.method;
        let argv = [];
        let run = (describe) => {
            return this._getData(describe).then(data => {
                argv.push(data);
            });
        };
        let check = () => {
            if (describes.length === 0) {
                return Promise.resolve([method, argv]);
            }

            let describe = describes.shift();
            return run(describe).then(check);
        };
        return check();
    }
}

module.exports = ReqDecoder;
