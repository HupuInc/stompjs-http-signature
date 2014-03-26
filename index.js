/*
 Copyright 2014 Hupu Inc., by Wang Wenlin <wangwenlin@hupu.com>
 BSD License.
 */

var httpSignature = require('http-signature');

/* HOWTO:
  Stomp.overWS = require('stompjs-http-signature').overWS;
 */
exports.overWS = function (url, options) {
  var socket;
  socket = wrapWS(url, options ? sign(url, options) : {});
  return this.over(socket);
};

function sign(url, options) {
  if (typeof url === 'string') {
    url = require('url').parse(url);
  }

  var dummyreq = {
    method: 'GET',
    path: url.path,
    headers: {},

    setHeader: function (k, v) {
      return this.headers[k.toLowerCase()] = v;
    },
    getHeader: function (k) {
      return this.headers[k.toLowerCase()];
    },
  };

  if (httpSignature.sign(dummyreq, options)) {
    return dummyreq.headers;
  } else {
    return {};
  }
}

function wrapWS(url, headers) {
  var WebSocketClient = require('websocket').client;
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

  var socket = new WebSocketClient();
  socket.on('connect', function(conn) {
    connection = conn;
    ws.onopen();
    connection.on('error', function(e) {
      return typeof ws.onclose === "function" ? ws.onclose(e) : void 0;
    });
    connection.on('close', function() {
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

  socket.connect(url, [], '', headers);
  return ws;
};
