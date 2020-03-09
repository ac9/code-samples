### ``dropSomeCollections(jsapi, matchFunction)``
Drops collections where ``matchFunction`` evaluates true provided the collection name.
- `jsapi` `<Object>`
- `matchFunction` `<Function>`

```js
pvh.dropSomeCollections(jsapi, function(collectionName){
	return collectionName === 'Opportunities';
}).then(function(result) {

});
```