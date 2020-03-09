### ``find(jsapi, collectionName, id, [projection])``
Returns an array that contains the document for ``id``.
- `jsapi` `<Object>`
- `collectionName` `<String>`
- `id` `<String>` or `<ObjectId>`
- `projection` `<Object>` : Optional, default is `{}`

```js
pvh.find(jsapi, 'Opportunities', '580a3bf182252315e664f341').then(function(result) {

});
```