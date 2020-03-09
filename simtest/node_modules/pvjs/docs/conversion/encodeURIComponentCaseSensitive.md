### ``encodeURIComponentCaseSensitive(str)``
Returns ``str`` encoded with encodeURIComponent and upper case characters are encoded with ``%##`` where ``##`` is the hex of the character.

- `str` `<String>`

```js
var ecodedString = PV.encodeURIComponentCaseSensitive('Hello World');
```