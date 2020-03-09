### ``setupMongoDBUrl(jsapi, serverHost, serverPort, [serverUserId], [serverPassword], [serverAuthDatabase], database, [options])``
Creates the url used for a mongo connection.
- `jsapi` `<Object>`
- `serverHost` `<String>`
- `serverPort` `<String>`
- `serverUserId` `<String>`
- `serverPassword` `<String>`
- `serverAuthDatabase` `<String>`
- `database` `<String>`
- `options` `<Object>`

```js
pvh.setupMongoDBUrl(jsapi, 'localhost', '27017', null, null, null, 'test.com', {
    socketTimeoutMS: 600000
}).then(function(success) {
    if (success) {
        console.log('Success');
    } else {
        console.log('Failure');
    }
});
```