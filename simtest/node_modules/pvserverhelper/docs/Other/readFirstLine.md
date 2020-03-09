### ``readFirstLine(filePath, options)``
Returns the first line separated by ``\n`` from ``filePath`` using a read stream with ``options``.
- `filePath` `<String>`
- `options` `<Object>`

```js
pvh.readFirstLine('/Users/textfile.txt', function(firstLine) {
	print(firstLine);
});
```