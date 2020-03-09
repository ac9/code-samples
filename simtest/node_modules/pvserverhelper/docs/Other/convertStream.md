### ``convertStream(readStream, writeStream, successCallback, failureCallback, [options], [decoding], [encoding])``
Converts the contents from a ``readStream`` to ``writeStream``. csv to json settings can be provided with ``options``.
- `readStream` `<Buffer>`
- `writeStream` `<Buffer>`
- `successCallback` `<function>`
- `failureCallback` `<function>`
- `options` `<Object>` : Optional, default is null
- `decoding` `<String>` : Optional, default is null
- `encoding` `<String>` : Optional, default is null

```js
var fs = require('fs');
var rd = fs.createReadStream('./hello.csv');
var wr = fs.createWriteStream('./hello.json');

pvh.convertStream(rd, wr, function(result){
	console.log('Success');
}, function(result){
	console.log('Failure');
}, {
    checkType: false,
    ignoreEmpty: true,
    headers: ['Name', 'Value'],
}, 'win1252', 'utf8');
```