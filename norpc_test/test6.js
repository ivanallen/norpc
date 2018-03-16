/**
 * @file 文件介绍
 * @author liufeng
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */
const norpc = require('../norpc/norpc');
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/'
};

let data = {
    name: 'baidu',
    age: 18
};

norpc.request(options, 'badFunc').then(res => {
    console.log(res);
}).catch(error => {
    console.error(error.stack);
});
