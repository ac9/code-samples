### ``spawn(jsapi, cmd, args, options)``
Executes ``cmd`` in the command line/terminal with ``args``.
- `jsapi` `<Object>`
- `cmd` `<String>`
- `arg` `<String[]>`
- `options` `<Object>` : Optional

```js
pvh.spawn(jsapi, 'node main.js', [], options).then(function(result){

});
```