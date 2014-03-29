var Stomp = require('stompjs');

// override
Stomp.overWS = require('../').overWS;

(function process() {
  var client = Stomp.overWS('ws://127.0.0.1:3000', {
    onerror: onend,
    onclose: onend,
    sign: {
      algorithm: 'hmac-sha256',
      keyId: 'id',
      key: 'key',
    },
  });

  client.debug = console.log.bind(console);

  client.connect({}, function onopen() {
    client.subscribe('/topic/foo', function (msg) {
      console.log(msg.body);
      msg.ack();
    }, {id: 'ex1.foo', persistent: true, ack: 'client'});
  });

  function onend(e) {
    if (e) console.log(e);
    if (client) {
      client = null;
      setTimeout(process, 1000);
    }
  }

})();
