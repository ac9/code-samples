### ``convertFile(source, target, [options], [decoding], [encoding])``
Converts csv to json from ``source`` to ``target`` with ``options``, ``decoding`` and ``encoding`` settings.
See https://www.npmjs.com/package/csvtojson for options.
- `source` `<String>`
- `target` `<String>`
- `options` `<Object>` : Optional, default is {}
- `decoding` `<String>` : Optional, default is null
- `encoding` `<String>` : Optional, default is null

```js
pvh.convertFile('./hello.csv', './hello.json', {
    checkType: false,
    ignoreEmpty: true,
    headers: ['Name', 'Value'],
}, 'win1252', 'utf8').then(function(result){

});
```