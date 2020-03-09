### ``saveFile(url, dest)``
Saves a file to ``dest`` using a writable stream with a httpGet request from ``url``.
- `url` `<String>`
- `dest` `<String>`
- `headers` `<Object>`: Optional

```js
pvh.saveFile('http://www.test.com/test.txt', '/Downloads/test.txt', function() {
	console.log('Done');
});
```