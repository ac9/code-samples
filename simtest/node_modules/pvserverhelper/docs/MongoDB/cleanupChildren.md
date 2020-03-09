### ``cleanupChildren(jsapi, collectionName, id, childrenMap)``
Removes the child value and child documents from a document.
- `jsapi` `<Object>`
- `collectionName` `<String>`
- `id` `<String>`
- `childrenMap` `<Object>`

```js
pvh.cleanupChildren(jsapi, 'Opportunities', '24g2k3jhtkuwegs', {
	Account: 'account'
}).then(function(result) {

});
```