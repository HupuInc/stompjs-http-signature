Stomp.js with http-signature support
====================================

Usage:

```javascript
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
```
