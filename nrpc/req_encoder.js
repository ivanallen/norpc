/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/
const Encoder = require('./encoder');
class ReqEncoder extends Encoder {
    constructor(writeStream) {
        super(writeStream);
        this._writeStream = writeStream;
    }

    write(method, ...argv) {
        let jsonBody = {
            method: method,
            describes:[]
        };
        let typeAndData = [];
        for (let arg of argv) {
            let [type, data] = this._getTypeAndData(arg);
            let describe = {
                type: type,
                length: data.length
            };
            jsonBody.describes.push(describe);
            typeAndData.push([type, data]);
        }
        let json = JSON.stringify(jsonBody);
        let header = this._createHeader(json.length);
        this._writeStream.write(header);
        this._writeStream.write(json);

        let end = true;
        for (let item of typeAndData) {
            let [type, data] = item;
            if (type === 'stream') {
                data.pipe(this._writeStream);
                end = false;
                // 流只能放到最后一个参数
                break;
            } else {
                this._writeStream.write(data);
            }
        }

        if (end) {
            this._writeStream.end();
        }
    }
}

module.exports = ReqEncoder;
