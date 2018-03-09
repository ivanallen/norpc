/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/
const Encoder = require('./encoder');

class ResEncoder extends Encoder {
    constructor(writeStream) {
        super(writeStream);
    }

    write(result) {
        if (!(result instanceof Promise)) {
            result = Promise.resolve(result);
        }
        return result.then(data => {
            if (data) {
                let [type, res] = this._getTypeAndData(data);
                let jsonBody = {
                    type: type,
                    length: res.length
                };
                let json = JSON.stringify(jsonBody);
                let header = this._createHeader(json.length);
                this._writeStream.write(header);
                this._writeStream.write(json);
                if (type === 'stream') {
                    res.pipe(this._writeStream);
                } else {
                    this._writeStream.write(res);
                    this._writeStream.end();
                }
            } else {
                let header = this._createHeader(0);
                this._writeStream.write(header);
                this._writeStream.end();
            }
        });
    }
}

module.exports = ResEncoder;
