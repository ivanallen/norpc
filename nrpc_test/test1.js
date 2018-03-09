/**
 * @file 文件介绍
 * @author liufeng@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/
const nrpc = require('../nrpc/nrpc');
const http = require('http');
const PassThrough = require('stream').PassThrough;

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/',
    method: 'POST'
};

let a = 78;
let b = 99.2;
nrpc.request(options, 'add', a, b).then(res => {
    console.log('%d + %d = %d', a, b, res);
}).catch(error => {
    console.error(error.stack);
});


nrpc.request(options, 'echo', 'hello world').then(res => {
    console.log(res);
}).catch(error => {
    console.error(error.stack);
});



