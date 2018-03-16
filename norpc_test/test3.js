/**
 * @file 文件介绍
 * @author liufeng
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */
const norpc = require('../norpc/norpc');
const http = require('http');
const PassThrough = require('stream').PassThrough;

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/'
};

let ss = new PassThrough();
norpc.request(options, 'echoStream', ss).then(res => {
    res.on('data', chunk => {
        console.log(chunk.toString());
    });
}).catch(error => {
    console.error(error.stack);
});


ss.write('今天星期几?');

setTimeout(() => {
    ss.write('今天星期六!');
    ss.end();
}, 3000);
