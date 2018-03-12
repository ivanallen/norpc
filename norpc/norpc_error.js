/**
 * @file 文件介绍
 * @author liufeng27@baidu.com
 */
/* eslint-disable fecs-camelcase */
/* jshint node:true */
/* jshint esversion:6 */

class NoRpcError extends Error {
    constructor(...params) {
        super(...params);
        this.name = 'NoRpcError';
    }
}

module.exports = NoRpcError;
