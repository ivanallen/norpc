/**
 * @file 文件介绍
 * @author liufeng27@baidu.com
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */

const PassThrough = require('stream').PassThrough;

const handlers = module.exports = {
    add(a, b) {
        return a + b;
    },
    echo(text) {
        return text;
    },

    // 无参函数
    getTime() {
        return Date.now();
    },

    // 支持流式数据传送
    pushMsg(stream) {
        return new Promise((resolve, reject) => {
            stream.on('data', chunk => {
                console.log(chunk.toString());
            });
            stream.on('end', resolve);
        });
    },

    // 流式回传
    echoStream(stream) {
        let ss = new PassThrough();
        stream.pipe(ss);
        return ss;
    },

    // 传递 json
    echoJson(body) {
        return body;
    },

    // 传递 2 进制
    echoBuffer(buf) {
        return buf;
    },

    // 抛异常
    badFunc() {
        throw new Error('test bad function');
    },

    // 抛异常
    sytaxErrorFunc() {
        let a = b;
        return 'hello';
    }
};
