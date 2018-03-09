/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/
const Decoder = require('./decoder');

class ResDecoder extends Decoder {
    constructor(readStream) {
        super(readStream);
    }

    _parse(jsonBody) {
        let describe = jsonBody;
        return this._getData(describe);
    }
}

module.exports = ResDecoder;
