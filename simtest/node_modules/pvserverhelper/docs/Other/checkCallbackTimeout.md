### ``checkCallbackTimeout(key, callback)``
Calls ``callback(null, null)`` if ``pvh.callbackTimeouts.hasOwnProperty(key) === true``.
- `key` `<String>`
- `callback` `<Function>`

```js
pvh.checkCallbackTimeout('timer1', callback);
```