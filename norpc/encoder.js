/**
 * @file 文件介绍
 * @author liufeng27@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/

const stream = require('stream');
const MAGIC = 0xccbb0123;
const HEAD_LENGTH = 48;
const NoRpcError = require('./norpc_error');

/**
 * 编码器基类，用户需要实现 write 函数
 *
 * @class
 */
class Encoder {
    constructor(writeStream) {
        this._writeStream = writeStream;
    }

    /**
     * 将数据序列化，并标识数据类型
     *
     * @param {mixed} data - 比如函数参数，返回值
     * @return {array} - [type, res]
     *      除了 stream 外，其它数据都序列化为 buffer
     */
    _getTypeAndData(data) {
        let type = 'raw';
        let res = null;
        if (data instanceof Error) {
            type = 'error';
            res = JSON.stringify({
                name: data.name,
                message: data.message,
                stack: data.stack
            });
        } else if (data instanceof stream.Readable) {
            type = 'stream';
            res = data;
        } else if (toString.call(data) === '[object String]') {
            type = 'string';
            res = new Buffer(data);
        } else if (typeof data === 'object' && !!data) {
            type = 'json';
            try {
                res = new Buffer(JSON.stringify(data));
            } catch (error) {
                console.error(error.stack);
            }
        } else if (toString.call(data) === '[object Number]') {
            type = 'number';
            res = new Buffer(8);
            res.writeDoubleLE(data, 0);
        } else if (data instanceof Buffer) {
            type = 'raw';
            res = data;
        } else {
            type = 'raw';
            res = new Buffer(data.toString()); // 默认
        }
        return [type, res];
    }

    /**
     * 创建 header
     *
     * @param {integer} jsonBodyLen - json 数据长度
     * @return {Buffer} - 协议头
     */
    _createHeader(jsonBodyLen) {
        let header = new Buffer(HEAD_LENGTH);
        header.writeUInt32LE(MAGIC, 0);
        header.writeUInt32LE(1, 4);
        header.write('', 8, 44);
        header.writeUInt32LE(jsonBodyLen, 44);
        return header;
    }
}

module.exports = Encoder;
