### ``returnImmediately(callback)``
Throws an error with a callback.
```
throw {
    'code': 'RETURN_IMMEDIATELY',
    'callback': function() {
        callback(null, null);
    }
};
```
- `callback` `<Function>`

```js
pvh.returnImmediately(callback);
```