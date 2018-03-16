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

let a = 78;
let b = 99.2;
norpc.request(options, 'add', a, b).then(res => {
    console.log('%d + %d = %d', a, b, res);
}).catch(error => {
    console.error(error.stack);
});


norpc.request(options, 'echo', 'hello world').then(res => {
    console.log(res);
}).catch(error => {
    console.error(error.stack);
});



norpc.request(options, 'getTime').then(res => {
    console.log(Date(res));
}).catch(error => {
    console.error(error.stack);
});
