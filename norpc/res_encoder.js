/**
 * @file 文件介绍
 * @author liufeng27@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/
const Encoder = require('./encoder');

/**
 * 服务端使用的编码器，用于将函数返回结果传输给客户端
 * 服务端依赖用户传递的写流。用户需要自己处理写流出错的情况。
 *
 * @class
 */
class ResEncoder extends Encoder {
    constructor(writeStream) {
        super(writeStream);
    }

    /**
     * 用于将结果传输回去
     *
     * @param {mixed} result - rpc 函数返回的结果
     */
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
        }).catch(error => {
            console.error("%s", error.stack);
            let [type, res] = this._getTypeAndData(error); 
            let jsonBody = {
                type: type,
                length: res.length
            };
            let json = JSON.stringify(jsonBody);
            let header = this._createHeader(json.length);
            this._writeStream.write(header);
            this._writeStream.write(json);
            this._writeStream.write(res);
            this._writeStream.end();
        });
    }
}

module.exports = ResEncoder;
