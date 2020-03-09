### ``createHash(str, len)``
Returns ``sha1`` hash hex string of ``str``.

- `str` `<String>`
- `len` `<Number>`: Optional, default is 32, max is 64

```js
var hash = PV.createHash('hello world', 256);
```