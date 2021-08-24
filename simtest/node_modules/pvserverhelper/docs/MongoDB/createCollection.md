### ``createCollection(jsapi, collectionName, [drop], [indices])``
Creates collection ``collectionName``. If ``drop`` is `true`, and the collection already exists, it would be dropped and recreated.
- `jsapi` `<Object>`
- `collectionName` `<String>`
- `drop` `<String>`: Optional, default is `false`
- `indices` `<Array>`

```js
pvh.createCollection(jsapi, 'Opportunities', true, [{
    key: {
        name: 1
    },
    name: 'name_1'
}]).then(function(result) {

});
```