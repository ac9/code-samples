### ``loginWithSession(jsapi, [options])``
Calls the RPM API Login on with an existing session with ``options``.
- `jsapi` `<Object>`
- `options` `<Object>`

```js
var jsapi = {
	PVSession: {
		engineSessionInfo: {
			url: 'http://localhost:80'
		},
		apiKey: 'ah1ht138ghwies'
	}
};
pvh.loginWithSession(jsapi, {
	timeOut: 180 * 60
}).then(function(success) {
    if (success) {
        console.log('Success');
    } else {
        console.log('Failure');
    }
});
```