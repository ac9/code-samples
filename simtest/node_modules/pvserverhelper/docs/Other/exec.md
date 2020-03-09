### ``exec(jsapi, cmd, options)``
Executes ``cmd`` in the command line/terminal.
- `jsapi` `<Object>`
- `cmd` `<String>`
- `options` `<Object>` : Optional, default is `{maxBuffer: 1024 * 500}`

```js
pvh.exec(jsapi, 'node main.js', options).then(function(result){

});
```