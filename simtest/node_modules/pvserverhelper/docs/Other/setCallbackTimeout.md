### ``setCallbackTimeout(key, timeout, callback)``
Calls ``callback(null, null)`` after ``timeout`` ms has passed for the ``key``. ``pvh.callbackTimeouts.hasOwnProperty(key) === false`` if callback is envoked.
- `key` `<String>`
- `timeout` `<Number>`
- `callback` `<Function>`

```js
pvh.setCallbackTimeout('timeout1', 1000, callback);
```