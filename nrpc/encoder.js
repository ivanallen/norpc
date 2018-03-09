/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/

const _ = require('underscore');
const stream = require('stream');
const MAGIC = 0xccbb0123;
const HEAD_LENGTH = 48;

class Encoder {
    constructor(writeStream) {
        this._writeStream = writeStream;
    }

    _getTypeAndData(data) {
        let type = 'raw';
        let res = null;
        if (data instanceof stream.Readable) {
            type = 'stream';
            res = data;
        } else if (_.isString(data)) {
            type = 'string';
            res = new Buffer(data);
        } else if (_.isObject(data)) {
            type = 'object';
            try {
                res = new Buffer(JSON.stringify(data));
            } catch (error) {
                console.error(error.stack);
            }
        } else if (_.isNumber(data)) {
            if (Number.isInteger(data)) {
                type = 'integer';
                res = new Buffer(4);
                res.writeInt32LE(data, 0);
            } else {
                type = 'float';
                res = new Buffer(8);
                res.writeDoubleLE(data, 0);
            }
        } else if (data instanceof Buffer) {
            type = 'raw';
            res = data;
        }
        return [type, res];
    }

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
