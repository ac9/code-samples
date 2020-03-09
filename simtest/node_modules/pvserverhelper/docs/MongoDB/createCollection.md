### ``createCollection(jsapi, collectionName, [drop], [indices])``
Creates collection ``collectionName``. If ``drop`` is `true`, and the collection already exists, it would be dropped and recreated.
- `jsapi` `<Object>`
- `collectionName` `<String>`
- `drop` `<String>`: Optional, default is `false`
- `indices` `<Array>`

```js
pvh.createCollection(jsapi, 'Opportunities', true, [{
    keys: {
        name: 1
    }
}]).then(function(result) {

});
```