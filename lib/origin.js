'use strict';

var URL = require('url');
var debug = require('debug')('unblocker:origin');

module.exports = function( /*config*/ ) {
    return function originHeader(data) {
        data.headers.origin = "https://netflix.com/";

        debug('host now %s', data.headers.host);
        debug('origin now %s', data.headers.origin);
    };
};
