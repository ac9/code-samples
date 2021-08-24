### ``createIndices(jsapi, collectionName, indices) - Deprecated``
Ensures that ``indices`` are applied to ``collectionName``.
- `jsapi` `<Object>`
- `collectionName` `<String>`
- `indices` `<Array>`

```js
pvh.createIndices(jsapi, 'Opportunities', [{
    keys: {
        name: 1
    }
}]).then(function(result) {

});
```