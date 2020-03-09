### ``move(jsapi, sourceCollection, targetCollection, filter, cleanId)``
Moves documents from ``sourceCollection`` to ``targetCollection``. If ``cleanId`` is provided, a new `_id` will be created for the documents.
- `jsapi` `<Object>`
- `sourceCollection` `<String>`
- `targetCollection` `<String>`
- `filter` `<Object>` : Optional, default is `{}`
- `cleanId` `<Object>` : Optional, default is `false`

```js
pvh.move(jsapi, 'Opportunities', 'Opportunities_temp').then(function(result) {

});
```