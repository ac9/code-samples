### ``loginWithUrl(jsapi, url, username, [password], [credKey], [sessionContext], [options])``
Calls the RPM API Login on ``url`` with ``username`` and ``password`` and ``credKey`` with ``sessionContext`` and ``options``.
- `jsapi` `<Object>`
- `url` `<String>`
- `username` `<String>`
- `password` `<String>`
- `credKey` `<String>`
- `sessionContext` `<Object>`
- `options` `<Object>`

```js
pvh.login(jsapi, 'http', 'localhost', 80, 'username', 'password', 'credKey', {
	AppName: 'Hello World'
}, {
	timeOut: 180 * 60
}).then(function(success) {
    if (success) {
        console.log('Success');
    } else {
        console.log('Failure');
    }
});
```