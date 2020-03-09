### ``genericErrHandler(jsapi, callback, [passError])``
Returns a function that can be used in a catch. Cleanup is call and the `callback` is called with an error. If `passError` is `true`, the response is called in the results rather than in the error.
- `jsapi` `<Object>`
- `callback` `<Function>`
- `passError` `<Boolean>`: Optional, default is `false`

```js
jsapi.pv.sendRequest('Query', params).then(function(result) {

}).catch(jsapi.pvserver.PVServerError, pvh.scriptErrHandler(jsapi, callback)).catch(pvh.genericErrHandler(jsapi, callback));
```