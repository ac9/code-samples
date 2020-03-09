### ``httpMethod(options)``
Sends a http ``request`` with the ``options``.
- `options` `<Object>`

```js
pvh.httpMethod({
    headers: {
        'user-agent': 'pvserverhelper',
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
    },
    method: 'POST',
    url: 'http://localhost:80'
}).then(function(result) {
    console.log(result);
});
```