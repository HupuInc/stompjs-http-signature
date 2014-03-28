/*
 Copyright 2014 Hupu Inc., by Wang Wenlin <wangwenlin@hupu.com>
 BSD License.
 */

var WebSocketClient = require('websocket').client;
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
      return this.headers[k.toLowerCase()] = v;
    },
    getHeader: function (k) {
      return this.headers[k.toLowerCase()];
    },
  }, options.sign);
}

function wrapWS(url, options) {
  var socket = new WebSocketClient();
  var connection = null;

  var ws = {
    url: url,
    send: function(d) {
      return connection.sendUTF(d);
    },
    close: function() {
      return connection.close();
    },
  };

  socket.on('connect', function(conn) {
    if (typeof options.onopen === "function") options.onopen(conn);

    connection = conn;
    ws.onopen();

    connection.on('error', function(e) {
      if (typeof options.onerror === "function") options.onerror(e);
      return typeof ws.onclose === "function" ? ws.onclose(e) : void 0;
    });
    connection.on('close', function() {
      if (typeof options.onclose === "function") options.onclose();
      return typeof ws.onclose === "function" ? ws.onclose() : void 0;
    });

    return connection.on('message', function(message) {
      var event;
      if (message.type === 'utf8') {
        event = {
          'data': message.utf8Data
        };
        return ws.onmessage(event);
      }
    });
  });

  socket.on('connectFailed', function(e) {
    if (typeof options.onerror === "function") options.onerror(e);
  });

  socket.connect(url, [], '', options.headers);
  return ws;
};
