### ``getABOMProperties(jsapi, appName, objectName)``
Returns an object of properties of ``objectName`` for ``appName``. Properties contain Name and _id for properties without the types 'expr', 'abomPropertyType', 'function'.
- `jsapi` `<Object>`
- `appName` `<String>`
- `objectName` `<String>`

```js
pvh.getABOMProperties(jsapi, 'CRM', 'Opportunities').then(function(result) {

});
```