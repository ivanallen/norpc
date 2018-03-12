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

/**
 * 服务端 rpc 注册
 *
 * @param {readable} readStream - 读流
 * @param {writeable} writeStream - 写流
 * @param {Object} funcs - rpc 函数
 *
 * @return {Promise}
 */
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

/**
 * 客户端 rpc 请求接口
 *
 * @param {Object} options - 服务端地址，端口，path
 *      options.hostname
 *      options.port
 *      options.path
 * @param {string} method - 方法名
 * @param {varlist} 请求参数列表
 */
function request(options, method, ...argv) {
    let client = new RpcClient(options);
    return client.request(method, ...argv);
}
