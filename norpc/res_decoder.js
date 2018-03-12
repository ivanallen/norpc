/**
 * @file 文件介绍
 * @author liufeng27@baidu.com
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */

const Decoder = require('./decoder');

/**
 * 客户端使用的解码器，用于将服务端传回的数据进行解码
 *
 * @class
 */
class ResDecoder extends Decoder {
    constructor(readStream) {
        super(readStream);
    }

    /**
     * 根据 jsonBody 从流中提取结果
     *
     * @param {Object} jsonBody
     *      {string} jsonBody.type - 数据类型
     *      {integer} jsonBody.length - 数据长度
     * @return {mixed} 返回解析出来的数据
     */
    _parse(jsonBody) {
        let describe = jsonBody;
        return this._getData(describe);
    }
}

module.exports = ResDecoder;
