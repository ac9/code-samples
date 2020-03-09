### ``createMongoProviderModel(jsapi, username, appName, dataSetId, [options])``
'Creates provider model with ``username`` for ``appName`` accessing ``dataSetId``. If ``dataSetId`` is the dbHostName instead, it will attempt as dataSetId first, then dbHostName.
- `jsapi` `<Object>`
- `username` `<String>`
- `appName` `<String>`
- `dataSetId` `<String>`
- `options` `<Object>`

```js
pvh.createMongoProviderModel(jsapi, 'admin@test.com', 'CRM', 'crm', {
    socketTimeoutMS: 600000
});
```