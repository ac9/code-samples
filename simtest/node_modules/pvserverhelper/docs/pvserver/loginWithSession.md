### ``loginWithSession(jsapi)``
Calls the RPM API Login on with an existing session.
- `jsapi` `<Object>`

```js
var jsapi = {
	PVSession: {
		engineSessionInfo: {
			url: 'http://localhost:80'
		},
		apiKey: 'ah1ht138ghwies'
	}
};
pvh.loginWithSession(jsapi).then(function(success) {
    if (success) {
        console.log('Success');
    } else {
        console.log('Failure');
    }
});
```