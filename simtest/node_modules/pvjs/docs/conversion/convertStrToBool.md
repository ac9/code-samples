### ``convertStrToBool(string, defaultBoolean)``
Returns an equivalent boolean value for ``string``. Valid boolean case insensitive strings for ``false`` are ``['false', 'no', '0', 'n', 'f']``. Valid boolean case insensitive strings for ``true`` are ``['true', 'yes', '1', 'y', 't']``.

- `string` `<String>`
- `defaultBoolean` `<Boolean>`: Optional, default is `false`

```js
var bool = PV.convertStrToBool('false');
```