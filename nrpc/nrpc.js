/**
 * @file 文件介绍
 * @author liufeng27@baidu.com
 */
/* eslint-disable fecs-camelcase */
/*jshint node:true*/
/*jshint esversion:6*/

const RpcServer = require('./rpc_server');
const RpcClient = require('./rpc_client');

module.exports = {
    server,
    request
};

function server(readStream, writeStream, funcs) {
    let server = new RpcServer(readStream, writeStream);
    return server.parse().then(([method, argv]) => {
        try {
            let f = funcs[method];
            let ret = f(...argv);
            return server.write(ret);
        } catch (error) {
            console.error(error.stack);
        }
    });
}

function request(options, method, ...argv) {
    let client = new RpcClient(options);
    return client.request(method, ...argv);
}
