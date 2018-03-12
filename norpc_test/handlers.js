/* jshint esversion:6 */

const PassThrough = require('stream').PassThrough;

const handlers = module.exports = {
    add(a, b) {
        return a + b;
    },
    echo(text) {
        return text;
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
    }
};
