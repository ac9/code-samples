### ``createMongoDB(jsapi)``
Creates a mongo connection with a url.
- `jsapi` `<Object>`

```js
var jsapi = {
	mongo: {
		url: 'mongodb://localhost:27017/test'
	}
};
pvh.createMongoDB(jsapi).then(function(success) {
    if (success) {
        console.log('Success');
    } else {
        console.log('Failure');
    }
});
```