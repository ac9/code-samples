### ``copy(jsapi, sourceCollection, targetCollection, filter, projection, overwriteKey)``
Copies the documents from ``sourceCollection`` to ``targetCollection``. If ``overwriteKey`` is provided, documents from ``targetCollection`` that match ``overwriteKey`` will be removed first, the new document will be inserted.
- `jsapi` `<Object>`
- `sourceCollection` `<String>`
- `targetCollection` `<String>`
- `filter` `<Object>` : Optional, default is `{}`
- `projection` `<Object>` : Optional, default is `{}`
- `overwriteKey` `<String>`

```js
pvh.copy(jsapi, 'Opportunities', 'Opportunities_temp').then(function(result) {

});
```