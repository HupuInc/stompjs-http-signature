var assert = require("assert");
var Stomp = require('stompjs');
var ws = require('ws');
var httpSignature = require('http-signature');

// override
Stomp.overWS = require('../').overWS;

// Global
var sign = {
  algorithm: 'hmac-sha256',
  keyId: 'id',
  key: 'key',
};

/* Test Fixture
 */
var server = null;

function startServer(simul) {
  server = new ws.Server({
    host: '127.0.0.1',
    port: 3000,

    verifyClient: function (info) {
      switch (simul) {
        case 'reject': return false;
        case 'accept': return true;
      }
      try {
        var parsed = httpSignature.parse(info.req);
        return httpSignature.verify(parsed, sign.key);
      } catch (e) {
        return false;
      }
    },
  });

  server.on('connection', function (c) {
    c.on('message', function (m) { c.send(m); });
  });
}

function stopServer() {
  if (server) {
    server.close();
    server = null;
  }
}

/* Test Cases
 */
afterEach(function(done){
  stopServer();
  done();
});

describe('WebSocket', function(){
  describe('#onerror', function(){
    it('should ECONNRESET when remote notexist', function(done){
      Stomp.overWS('ws://127.0.0.1:3000', {
        onerror: function (e) { if (e) done(); },
      })
    })

    it('should error when remote reject, no sign', function(done){
      startServer('reject');
      Stomp.overWS('ws://127.0.0.1:3000', {
        onerror: function (e) { if (e) done(); },
      })
    })

    it('should error when remote reject, miss sign', function(done){
      startServer();
      Stomp.overWS('ws://127.0.0.1:3000', {
        onerror: function (e) { if (e) done(); },
      })
    })

    it('should error when remote reject, with invalid sign', function(done){
      startServer();
      Stomp.overWS('ws://127.0.0.1:3000', {
        onerror: function (e) { if (e) done(); },
        sign: {
          algorithm: 'hmac-sha256',
          keyId: 'id',
          key: 'keyerr',
        },
      })
    })
  })

  describe('#onclose', function(){
    it('should call on remote close', function(done){
      startServer('accept');
      Stomp.overWS('ws://127.0.0.1:3000', {
        onopen: function() { stopServer(); },
        onclose: function() { done(); },
      }).connect({}, function() {});
    })
  })
});

describe('StompClient', function(){
  describe('#onopen', function(){
    it('should ok when normal connect, no sign', function(done){
      startServer('accept');
      Stomp.overWS('ws://127.0.0.1:3000', {
        onopen: function() { done(); },
      }).connect({}, function() {});
    })

    it('should ok when normal connect, with sign', function(done){
      startServer();
      Stomp.overWS('ws://127.0.0.1:3000', {
        onopen: function() { done(); },
        sign: sign,
      }).connect({}, function() {});
    })
  })
});
