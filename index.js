/*
 Copyright 2014 Hupu Inc., by Wang Wenlin <wangwenlin@hupu.com>
 BSD License.
 */

var WebSocketClient = require('websocket').w3cwebsocket;
var httpSignature = require('http-signature');

/* HOWTO:
  Stomp.overWS = require('stompjs-http-signature').overWS;

  var client = Stomp.overWS('ws://127.0.0.1:3000', {
    onerror: function onerr(e) {},
    onclose: function onclose() {},
    sign: {
      algorithm: 'hmac-sha256',
      keyId: 'id',
      key: 'key',
    },
  });
 */
exports.overWS = function (url, options) {
  if (!options) options = {};
  if (!options.headers) options.headers = {};
  if (options.sign) sign(url, options);
  return this.over(wrapWS(url, options));
};

function sign(url, options) {
  if (typeof url === 'string') {
    url = require('url').parse(url);
  }

  httpSignature.sign({
    method: 'GET',
    path: url.path,
    headers: options.headers,

    setHeader: function (k, v) {
      return (this.headers[k.toLowerCase()] = v);
    },
    getHeader: function (k) {
      return this.headers[k.toLowerCase()];
    },
  }, options.sign);
}

function wrapWS(url, options) {
  var socket = new WebSocketClient(url, [], '', options.headers);

  var ws = {
    url: url,
    send: function(d) {
      return socket.send(d);
    },
    close: function() {
      return socket.close();
    },
  };

  socket.onerror = function(evt) {
    if (typeof ws.onerror === 'function') {
      ws.onerror(evt);
    }
  };

  socket.onclose = function(evt) {
    if (typeof ws.onclose === 'function') {
      ws.onclose(evt);
    }
  };

  socket.onmessage = function(evt) {
    ws.onmessage(evt);
  };

  socket.onopen = function() {
    ws.onopen();
  };

  return ws;
}
