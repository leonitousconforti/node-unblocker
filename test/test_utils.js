var http = require('http'),
    async = require('async'),
    app = require('../app').getApp(false); // false = no redis

exports.getServers = function(sourceContent, charset, next) {
    if (typeof charset == 'function') {
        next = charset;
        charset = false;
    }

    function sendContent(req, res) {
        res.writeHead(200, {
            'content-type': 'text/html' + (charset ?  '; charser=' + charset : '')
        });
        res.end(sourceContent);
    }

    var proxyServer = http.createServer(app),
        remoteServer = http.createServer(sendContent);

    proxyServer.setTimeout(5000);
    remoteServer.setTimeout(5000);

    async.parallel([
        proxyServer.listen.bind(proxyServer, 8080),
        remoteServer.listen.bind(remoteServer, 8081)
    ], function(err) {
        next(err, {
            proxyServer: proxyServer,
            remoteServer: remoteServer,
            kill: function(next) {
                async.parallel([
                    remoteServer.close.bind(remoteServer),
                    proxyServer.close.bind(proxyServer),
                ], next);
            }
        });
    });
};
