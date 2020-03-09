### ``listFiles(dir, conditionFunc)``
Returns an array of all files under `dir`. `conditionFunc` can be provided to filter each specific file path.
- `dir` `<String>`
- `conditionFunc` `<Function>`

```js
pvh.listFiles('/Users', function(filePath) {
	return filePath.endsWith('.json');
});
```