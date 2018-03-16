/**
 * @file 文件介绍
 * @author liufeng
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */
const Decoder = require('./decoder');

/**
 * 服务端所使用的解码器，用于解析函数名和参数表
 *
 * @class
 */
class ReqDecoder extends Decoder {
    constructor(readStream) {
        super(readStream);
    }

    /**
     * 参数解析
     *
     * @param {Object} jsonBody -
     * @return {Array} - [method, argv]
     *      第一个元素是方法名，第二个元素是数组，参数表。
     */
    _parse(jsonBody) {
        let describes = jsonBody.describes;
        let method = jsonBody.method;
        let argv = [];
        let run = describe => {
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
